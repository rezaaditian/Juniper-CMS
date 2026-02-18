import { type NextRequest, NextResponse } from "next/server"
import { getSession, refreshSession, setSessionCookie } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
  try {
    const currentSession = await getSession()

    if (!currentSession) {
      return NextResponse.json({ error: "No active session" }, { status: 401 })
    }

    const newToken = await refreshSession(currentSession)

    if (!newToken) {
      return NextResponse.json({ error: "Session refresh not needed or failed" }, { status: 400 })
    }

    await setSessionCookie(newToken)

    return NextResponse.json({ success: true, refreshed: true })
  } catch (error) {
    console.error("Session refresh error:", error)
    return NextResponse.json({ error: "Session refresh failed" }, { status: 500 })
  }
}
