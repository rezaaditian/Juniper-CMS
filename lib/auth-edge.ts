import { jwtVerify, SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "fallback-secret-key")

export interface SessionPayload {
  userId: string
  exp: number
}

export async function verifySessionEdge(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      clockTolerance: 30,
    })
    return payload as SessionPayload
  } catch (error) {
    console.error("Edge session verification failed:", error instanceof Error ? error.message : "Unknown error")
    return null
  }
}

export async function createSessionEdge(userId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days

  const payload: SessionPayload = {
    userId,
    exp,
  }

  return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime(exp).sign(secret)
}