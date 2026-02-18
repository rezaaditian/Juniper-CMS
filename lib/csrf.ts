import { cookies } from "next/headers";
import crypto from "crypto";

const CSRF_COOKIE = "csrf-token";
const secret = getSessionSecret();

function getSessionSecret(): Uint8Array {
  if (process.env.SESSION_SECRET) {
    return new TextEncoder().encode(process.env.SESSION_SECRET);
  }

  // Development fallback - generate a consistent secret based on NODE_ENV
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "⚠️  SESSION_SECRET not set. Using development fallback. Set SESSION_SECRET for production!"
    );
    return new TextEncoder().encode(
      "dev-fallback-secret-change-in-production-" +
        (process.env.NODE_ENV || "dev")
    );
  }

  throw new Error(
    "SESSION_SECRET environment variable is required for production"
  );
}

export function generateCSRFToken() {
  const random = crypto.randomBytes(8).toString("hex");
  const timestamp = Date.now();
  const data = `${random}.${timestamp}`;
  const hmac = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return `${random}.${timestamp}.${hmac}`;
}

export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });

  return token;
}

export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE)?.value || null;
}

// export async function verifyCSRFToken(token: string): Promise<boolean> {
//   if (!token) return false
//   const storedToken = await getCSRFToken()
//   return storedToken === token
// }
export async function verifyCSRFToken(
  token: string,
  maxAgeMs = 1000 * 60 * 60
) {
  const [random, timestampStr, hmac] = token.split(".");
  const data = `${random}.${timestampStr}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");

  const now = Date.now();
  const timestamp = parseInt(timestampStr, 10);
  const isFresh = now - timestamp < maxAgeMs;

  return hmac === expected && isFresh;
}

// Client-side function to get CSRF token
export function getClientCSRFToken(): string {
  if (typeof document === "undefined") return "";

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === CSRF_COOKIE) {
      return decodeURIComponent(value);
    }
  }
  return "";
}
