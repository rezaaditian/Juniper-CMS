import { type NextRequest, NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/auth-server";
import { run, get, query } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { verifyCSRFToken } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limit";
import type { z } from "zod";

export interface CrudConfig<T = any> {
  tableName: string;
  schema: z.ZodSchema<T>;
  slugField?: string;
  requiredFields?: string[];
  defaultValues?: Record<string, any>;
  transformData?: (data: T) => Record<string, any>;
  publicFilter?: string
  orderBy?: string;
}

function sanitizeTableName(tableName: string): string {
  // Only allow alphanumeric characters and underscores
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    throw new Error("Invalid table name");
  }
  return tableName;
}

function applyRateLimit(
  request: NextRequest,
  operation: string
): { success: boolean; error?: string } {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
  const identifier = `${ip}-${operation}`;

  // Different limits for different operations
  const limits = {
    read: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 per minute
    write: { maxAttempts: 20, windowMs: 60 * 1000 }, // 20 per minute
    bulk: { maxAttempts: 5, windowMs: 60 * 1000 }, // 5 per minute
  };

  const limit = limits[operation as keyof typeof limits] || limits.read;
  const result = rateLimit(identifier, limit.maxAttempts, limit.windowMs);

  if (!result.success) {
    return {
      success: false,
      error: `Rate limit exceeded. Try again in ${Math.ceil(
        (result.resetTime - Date.now()) / 1000
      )} seconds.`,
    };
  }

  return { success: true };
}

// Universal GET handler for listing resources
export async function handleList<T>(
  request: NextRequest,
  config: CrudConfig<T>
): Promise<NextResponse> {
  try {
    const rateLimitResult = applyRateLimit(request, "read");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const authResult = await requireAuthAPI(request);
    const isAuthed = !(authResult instanceof NextResponse);

    const url = new URL(request.url);
    const page = Math.max(
      1,
      Math.min(100, Number.parseInt(url.searchParams.get("page") || "1"))
    ); // Added bounds checking
    const limit = Math.max(
      1,
      Math.min(100, Number.parseInt(url.searchParams.get("limit") || "50"))
    ); // Added bounds checking
    const search = url.searchParams.get("search")?.slice(0, 100) || ""; // Limited search length
    const status = url.searchParams.get("status") || "";
    const simple = url.searchParams.get("simple") === "true";

    const safeTableName = sanitizeTableName(config.tableName);

    let whereClauses: string[] = [];
    const params: any[] = [];

    if (search) {
      whereClauses.push("title LIKE ?");
      params.push(`%${search}%`);
    }

    if (status && status !== "all") {
      const statusClause = status === "active" ? "active = 1" : "active = 0";
      whereClauses.push(statusClause);
    }

    if (!isAuthed && config.publicFilter) {
      whereClauses.push(config.publicFilter);
    }

    const whereClause = whereClauses.length
        ? `WHERE ${whereClauses.join(" AND ")}`
        : "";
    const offset = (page - 1) * limit;
    function hasColumn(table: string, column: string): boolean {
      try {
        const cols = query<{ name: string }>(`PRAGMA table_info(${table})`);
        return cols.some(c => c.name === column);
      } catch {
        return false;
      }
    }
    const orderBy = hasColumn(safeTableName, "order_index")
        ? "order_index ASC, created_at DESC"
        : "created_at DESC";

    const items = query(
        `SELECT * FROM ${safeTableName} ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    if (simple) {
      return NextResponse.json(items);
    }

    const totalResult = query<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${safeTableName} ${whereClause}`,
      params
    );
    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error(
      `List ${config.tableName} error:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ); // Sanitized error message
  }
}

// Universal GET handler for single resource
export async function handleGet<T>(
  request: NextRequest,
  config: CrudConfig<T>,
  id: string
): Promise<NextResponse> {
  try {
    const rateLimitResult = applyRateLimit(request, "read");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const authResult = await requireAuthAPI(request);
    const isAuthed = !(authResult instanceof NextResponse)

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const safeTableName = sanitizeTableName(config.tableName);

    let item

    if (isAuthed) {
      item = get(`SELECT * FROM ${safeTableName} WHERE id = ?`, [id])
    } else {
      if (config.publicFilter) {
        item = get(
          `SELECT * FROM ${safeTableName} WHERE id = ? AND ${config.publicFilter}`,
          [id]
        )
      } else {
        item = get(`SELECT * FROM ${safeTableName} WHERE id = ?`, [id])
      }
    }


    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error(
      `Get ${config.tableName} error:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Universal POST handler for creating resources
export async function handleCreate<T>(
  request: NextRequest,
  config: CrudConfig<T>
): Promise<NextResponse> {
  try {
    const rateLimitResult = applyRateLimit(request, "write");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const authResult = await requireAuthAPI(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Parse JSON body with better error handling
    let body: any;
    try {
      const rawBody = await request.text();

      body = JSON.parse(rawBody);
    } catch (e) {
      console.error("[handleCreate] Failed to parse JSON body:", e);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { csrfToken, ...data } = body;

    // CSRF token validation
    if (!csrfToken) {
      console.error("[handleCreate] Missing CSRF token");
      return NextResponse.json(
        { error: "Missing CSRF token" },
        { status: 403 }
      );
    }

    try {
      const isValidCSRF = await verifyCSRFToken(csrfToken);

      if (!isValidCSRF) {
        return NextResponse.json(
          { error: "Invalid CSRF token" },
          { status: 403 }
        );
      }
    } catch (csrfError) {
      console.error("[handleCreate] CSRF verification error:", csrfError);
      return NextResponse.json(
        { error: "CSRF token verification failed" },
        { status: 403 }
      );
    }

    // Schema validation
    let validatedData: T;
    try {
      validatedData = config.schema.parse(data);
    } catch (validationError) {
      console.error(
        "[handleCreate] Schema validation failed:",
        validationError
      );
      if (validationError instanceof Error) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validationError.message,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Transform data
    let transformedData: Record<string, any>;
    try {
      transformedData = config.transformData
        ? config.transformData(validatedData)
        : (validatedData as any);
    } catch (transformError) {
      console.error(
        "[handleCreate] Data transformation failed:",
        transformError
      );
      return NextResponse.json(
        { error: "Data transformation failed" },
        { status: 500 }
      );
    }

    // Sanitize table name
    let safeTableName: string;
    try {
      safeTableName = sanitizeTableName(config.tableName);
    } catch (tableError) {
      console.error("[handleCreate] Invalid table name:", tableError);
      return NextResponse.json(
        { error: "Invalid table configuration" },
        { status: 500 }
      );
    }

    // Handle slug field
    if (
      config.slugField &&
      transformedData.title &&
      !transformedData[config.slugField]
    ) {
      try {
        transformedData[config.slugField] = slugify(transformedData.title);
      } catch (slugError) {
        console.error("[handleCreate] Slug generation failed:", slugError);
        return NextResponse.json(
          { error: "Failed to generate slug" },
          { status: 500 }
        );
      }
    }

    // Check for existing slug
    if (config.slugField && transformedData[config.slugField]) {
      try {
        const existing = get(
          `SELECT id FROM ${safeTableName} WHERE ${config.slugField} = ?`,
          [transformedData[config.slugField]]
        );

        if (existing) {
          return NextResponse.json(
            {
              error: `A ${config.tableName.slice(0, -1)} with this ${
                config.slugField
              } already exists`,
            },
            { status: 400 }
          );
        }
      } catch (dbError) {
        console.error("[handleCreate] Database slug check failed:", dbError);
        return NextResponse.json(
          { error: "Database query failed" },
          { status: 500 }
        );
      }
    }

    // Prepare final data
    const finalData = { ...config.defaultValues, ...transformedData };

    // Validate required fields
    if (config.requiredFields) {
      const missingFields = config.requiredFields.filter(
        (field) =>
          !finalData.hasOwnProperty(field) ||
          finalData[field] === null ||
          finalData[field] === undefined
      );
      if (missingFields.length > 0) {
        console.error("[handleCreate] Missing required fields:", missingFields);
        return NextResponse.json(
          {
            error: "Missing required fields",
            fields: missingFields,
          },
          { status: 400 }
        );
      }
    }

    // Prepare database insertion
    const fields = Object.keys(finalData).filter(
      (key) => finalData[key] !== undefined
    );
    const placeholders = fields.map(() => "?").join(", ");
    const values = fields.map((field) => finalData[field]);

    // Execute database insertion
    try {
      const result = run(
        `INSERT INTO ${safeTableName} (${fields.join(
          ", "
        )}) VALUES (${placeholders})`,
        values
      );

      return NextResponse.json(
        {
          id: result.lastInsertRowid,
          success: true,
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error("[handleCreate] Database insertion failed:", dbError);

      // Check if it's a constraint violation
      if (
        dbError instanceof Error &&
        dbError.message.includes("UNIQUE constraint")
      ) {
        return NextResponse.json(
          {
            error: "A record with this information already exists",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error: "Database insertion failed",
          details:
            dbError instanceof Error
              ? dbError.message
              : "Unknown database error",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error(
      `[handleCreate] Unhandled error in ${config.tableName}:`,
      error
    );
    console.error("[handleCreate] Error stack:", error.stack);

    // Don't expose internal errors in production
    return NextResponse.json(
      {
        error: "Internal server error",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 }
    );
  }
}

// Universal PUT handler for updating resources
export async function handleUpdate<T>(
  request: NextRequest,
  config: CrudConfig<T>,
  id: string
): Promise<NextResponse> {
  try {
    const rateLimitResult = applyRateLimit(request, "write");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const authResult = await requireAuthAPI(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { csrfToken, ...data } = body;

    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    const validatedData = config.schema.parse(data);
    const transformedData = config.transformData
      ? config.transformData(validatedData)
      : validatedData;

    const safeTableName = sanitizeTableName(config.tableName);
    const existing = get(`SELECT * FROM ${safeTableName} WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (config.slugField && transformedData[config.slugField]) {
      const duplicate = get(
        `SELECT id FROM ${safeTableName} WHERE ${config.slugField} = ? AND id != ?`,
        [transformedData[config.slugField], id]
      );
      if (duplicate) {
        return NextResponse.json(
          {
            error: `A ${config.tableName.slice(0, -1)} with this ${
              config.slugField
            } already exists`,
          },
          { status: 400 }
        );
      }
    }

    const fields = Object.keys(transformedData);
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...fields.map((field) => transformedData[field]), id];

    run(
      `UPDATE ${safeTableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(
      `Update ${config.tableName} error:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Universal DELETE handler for single resource
export async function handleDelete<T>(
  request: NextRequest,
  config: CrudConfig<T>,
  id: string
): Promise<NextResponse> {
  try {
    const rateLimitResult = applyRateLimit(request, "write");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const authResult = await requireAuthAPI(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const safeTableName = sanitizeTableName(config.tableName);
    const existing = get(`SELECT * FROM ${safeTableName} WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    run(`DELETE FROM ${safeTableName} WHERE id = ?`, [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(
      `Delete ${config.tableName} error:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Universal bulk delete handler
export async function handleBulkDelete<T>(
  request: NextRequest,
  config: CrudConfig<T>
): Promise<NextResponse> {
  try {
    const rateLimitResult = applyRateLimit(request, "bulk");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const authResult = await requireAuthAPI(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { ids, csrfToken } = body;

    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100) {
      return NextResponse.json(
        { error: "Invalid selection (max 100 items)" },
        { status: 400 }
      );
    }

    if (!ids.every((id) => typeof id === "number" && id > 0)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const safeTableName = sanitizeTableName(config.tableName);
    const placeholders = ids.map(() => "?").join(", ");
    run(`DELETE FROM ${safeTableName} WHERE id IN (${placeholders})`, ids);

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error: any) {
    console.error(
      `Bulk delete ${config.tableName} error:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Universal bulk update handler (for status changes, etc.)
export async function handleBulkUpdate<T>(
  request: NextRequest,
  config: CrudConfig<T>
): Promise<NextResponse> {
  try {
    const rateLimitResult = applyRateLimit(request, "bulk");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const authResult = await requireAuthAPI(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { ids, updates, csrfToken } = body;

    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100) {
      return NextResponse.json(
        { error: "Invalid selection (max 100 items)" },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    if (!ids.every((id) => typeof id === "number" && id > 0)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const safeTableName = sanitizeTableName(config.tableName);
    const fields = Object.keys(updates);
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const placeholders = ids.map(() => "?").join(", ");
    const values = [...fields.map((field) => updates[field]), ...ids];

    run(
      `UPDATE ${safeTableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      values
    );

    return NextResponse.json({ success: true, updated: ids.length });
  } catch (error: any) {
    console.error(
      `Bulk update ${config.tableName} error:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// Universal BULK REORDER handler
export async function handleReorder<T>(
    request: NextRequest,
    config: CrudConfig<T>
): Promise<NextResponse> {
  try {
    const authResult = await requireAuthAPI(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Parse body
    const body = await request.json();
    const { csrfToken, items } = body;

    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return NextResponse.json(
          { error: "Invalid CSRF token" },
          { status: 403 }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
          { error: "Invalid payload: items must be an array" },
          { status: 400 }
      );
    }

    const safeTableName = sanitizeTableName(config.tableName);

    const stmt = run;
    const dbUpdates = [];

    for (const item of items) {
      if (!item.id || typeof item.order_index !== "number") continue;
      dbUpdates.push(
          stmt(
              `UPDATE ${safeTableName} 
           SET order_index = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
              [item.order_index, item.id]
          )
      );
    }

    return NextResponse.json({ success: true, updated: items.length });
  } catch (error: any) {
    console.error(`Reorder ${config.tableName} error:`, error.message);
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
  }
}
