import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPrefixes = ["/admin", "/analyst", "/executive"];

/**
 * Edge-safe auth: do not import `@/server/auth` here — that pulls bcrypt + DB into
 * the middleware bundle and breaks on Vercel Edge (webpack "reading 'call'" / RSC issues).
 * JWT session strategy + getToken() matches Auth.js encrypted session cookies.
 */
export async function middleware(request: NextRequest) {
  const secure = request.nextUrl.protocol === "https:";
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: secure,
  });

  const pathname = request.nextUrl.pathname;
  const loggedIn = !!token;
  const role = token?.role as string | undefined;

  if (pathname.startsWith("/login")) {
    if (loggedIn) {
      if (role === "executive") return NextResponse.redirect(new URL("/executive", request.url));
      if (role === "super_admin") return NextResponse.redirect(new URL("/admin", request.url));
      return NextResponse.redirect(new URL("/analyst", request.url));
    }
    return NextResponse.next();
  }

  const needsAuth = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (needsAuth && !loggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "super_admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname.startsWith("/analyst") && role !== "analyst" && role !== "super_admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname.startsWith("/executive") && role !== "executive" && role !== "super_admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/analyst/:path*", "/executive/:path*", "/login"],
};
