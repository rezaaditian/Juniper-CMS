import { NextResponse } from "next/server";
import { setCSRFToken } from "@/lib/csrf";
import { generateCSRFToken } from "@/lib/csrf";

export async function GET() {
  try {
    // const token = await setCSRFToken()
    const token = generateCSRFToken();
    const response = NextResponse.json({ token });

    // Also set as a readable cookie for client-side access
    response.cookies.set("csrf-token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}
