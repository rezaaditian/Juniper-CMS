import { NextResponse } from "next/server"
import { clearSessionCookie } from "@/lib/auth-server"

export async function POST() {
  try {
    await clearSessionCookie()

    const response = NextResponse.json({ success: true })

    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
