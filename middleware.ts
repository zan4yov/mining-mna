import { auth } from "@/server/auth";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/admin", "/analyst", "/executive"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const loggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/login")) {
    if (loggedIn) {
      if (role === "executive") return NextResponse.redirect(new URL("/executive", req.url));
      if (role === "super_admin") return NextResponse.redirect(new URL("/admin", req.url));
      return NextResponse.redirect(new URL("/analyst", req.url));
    }
    return NextResponse.next();
  }

  const needsAuth = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (needsAuth && !loggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && role !== "super_admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/analyst") && role !== "analyst" && role !== "super_admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/executive") && role !== "executive" && role !== "super_admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/:path*", "/analyst/:path*", "/executive/:path*", "/login"],
};
