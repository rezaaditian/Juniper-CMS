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
}

// Client-safe auth utilities
export function isValidSession(session: SessionPayload | null): session is SessionPayload {
  if (!session) return false
  return session.exp > Math.floor(Date.now() / 1000)
}

export function isAdmin(session: SessionPayload | null): boolean {
  return session?.role === "admin"
}
