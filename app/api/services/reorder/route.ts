import { handleReorder } from "@/lib/crud";
import { serviceSchema } from "@/lib/validation";
import { type NextRequest } from "next/server";

const config = {
    tableName: "services",
    schema: serviceSchema,
};

export async function PUT(request: NextRequest) {
    return handleReorder(request, config);
}
