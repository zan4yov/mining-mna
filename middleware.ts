import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/admin", "/analyst", "/executive"];

type SessionPayload = {
  user?: { role?: string } | null;
};

/**
 * Edge middleware must not import `@/server/auth` (bcrypt + DB) or `next-auth/jwt`
 * (`jose` uses APIs like CompressionStream that are unreliable on Vercel Edge).
 * Instead, call the Node route `/api/auth/session` with the incoming Cookie header —
 * it decrypts the session correctly in production.
 */
async function getSessionFromEdge(request: NextRequest): Promise<SessionPayload> {
  const url = new URL("/api/auth/session", request.url);
  const headers: Record<string, string> = {
    cookie: request.headers.get("cookie") ?? "",
  };
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) headers["x-forwarded-host"] = host;
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) headers["x-forwarded-proto"] = proto;

  const res = await fetch(url, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) return {};
  try {
    const raw: unknown = await res.json();
    if (!raw || typeof raw !== "object") return {};
    return raw as SessionPayload;
  } catch {
    return {};
  }
}

export async function middleware(request: NextRequest) {
  const session = await getSessionFromEdge(request);
  const user = session?.user;
  const loggedIn = !!user;
  const role = user?.role;

  const pathname = request.nextUrl.pathname;

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
