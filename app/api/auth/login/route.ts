import { type NextRequest, NextResponse } from "next/server";
import { validateCredentials } from "@/lib/auth-server";
import { createSessionEdge } from "@/lib/auth-edge";
import { loginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || "unknown";
    const rateLimitResult = rateLimit(ip, 5, 60 * 1000); // 5 attempts per minute

    const body = await request.json();
    const { username, password, token } = loginSchema.parse(body);

    // Jika sudah melewati rate limit, wajib captcha
    if (!rateLimitResult.success) {
      if (!token) {
        return NextResponse.json(
          {
            error: "Captcha required",
            retryAfter: Math.ceil(rateLimitResult.retryAfter / 1000),
          },
          { status: 429 }
        );
      }

      // ✅ Verifikasi captcha
      const captchaVerify = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY}&response=${token}`,
        { method: "POST" }
      );
      const captchaRes = await captchaVerify.json();

      if (!captchaRes.success) {
        return NextResponse.json(
          { error: "Captcha verification failed" },
          { status: 400 }
        );
      }
    }

    const user = await validateCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const tokenSession = await createSessionEdge(user.id.toString());

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

    response.cookies.set("session", tokenSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
