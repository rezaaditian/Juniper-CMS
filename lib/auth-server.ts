"use server"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { get } from "./db"
import { redirect } from "next/navigation"
import { type NextRequest, NextResponse } from "next/server"

function getSessionSecret(): Uint8Array {
  if (process.env.SESSION_SECRET) {
    return new TextEncoder().encode(process.env.SESSION_SECRET)
  }

  // Development fallback - generate a consistent secret based on NODE_ENV
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️  SESSION_SECRET not set. Using development fallback. Set SESSION_SECRET for production!")
    return new TextEncoder().encode("dev-fallback-secret-change-in-production-" + (process.env.NODE_ENV || "dev"))
  }

  throw new Error("SESSION_SECRET environment variable is required for production")
}

const secret = getSessionSecret()
const SESSION_COOKIE = "session"

export interface User {
  id: number
  username: string
  role: string
}

export interface SessionPayload {
  userId: number
  username: string
  role: string
  exp: number
  iat: number // Added issued at timestamp for better security
}

export async function createSession(user: User): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: now + 4 * 60 * 60, // Reduced session duration to 4 hours for better security
    iat: now, // Added issued at timestamp
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("4h") // Updated expiration time
    .setIssuedAt()
    .sign(secret)
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      clockTolerance: 30, // 30 seconds tolerance
    })
    return payload as SessionPayload
  } catch (error) {
    console.error("Session verification failed:", error instanceof Error ? error.message : "Unknown error")
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (!token) return null

    return await verifySession(token)
  } catch (error) {
    console.error("Session error:", error)
    return null
  }
}

export async function validateCredentials(username: string, password: string): Promise<User | null> {
  try {
    if (!username || !password || username.length > 100 || password.length > 200) {
      return null
    }

    const user = get<User & { password_hash: string }>(
      "SELECT id, username, password_hash, role FROM users WHERE username = ? LIMIT 1", // Added LIMIT for safety
      [username.trim().toLowerCase()], // Normalize username
    )

    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return null

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    }
  } catch (error) {
    console.error("Credential validation error:", error)
    return null
  }
}

export async function requireAuthAPI(request: NextRequest): Promise<NextResponse | SessionPayload> {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return session
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()

  if (!session) {
    redirect("/admin/login")
  }

  return session
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // Changed from "lax" to "strict" for better CSRF protection
    maxAge: 4 * 60 * 60, // Updated to match new session duration
    path: "/",
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
}

export async function refreshSession(currentSession: SessionPayload): Promise<string | null> {
  try {
    const timeUntilExpiry = currentSession.exp - Math.floor(Date.now() / 1000)
    if (timeUntilExpiry > 60 * 60) {
      return null // No refresh needed
    }

    // Get fresh user data
    const user = get<User>("SELECT id, username, role FROM users WHERE id = ? LIMIT 1", [currentSession.userId])
    if (!user) {
      return null
    }

    return await createSession(user)
  } catch (error) {
    console.error("Session refresh error:", error)
    return null
  }
}

export async function logout(): Promise<void> {
  await clearSessionCookie()
  // const cookieStore = await cookies()
  // cookieStore.set(SESSION_COOKIE, "", {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "strict", // Updated to match cookie settings
  //   maxAge: 0,
  //   path: "/",
  // })
}
