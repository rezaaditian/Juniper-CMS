import { type NextRequest, NextResponse } from "next/server";
import { verifySessionEdge } from "@/lib/auth-edge";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Allow login page
    if (request.nextUrl.pathname === "/admin/login") {
      const token = request.cookies.get("session")?.value;
      if (token) {
        const session = await verifySessionEdge(token);
        if (session) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
      return NextResponse.next();
    }

    // Check session for all other admin routes
    const token = request.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const session = await verifySessionEdge(token);
      if (!session) {
        const response = NextResponse.redirect(
          new URL("/admin/login", request.url)
        );
        response.cookies.set("session", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 0,
          path: "/",
        });
        return response;
      }
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware session verification error:", error);
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
      response.cookies.set("session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
