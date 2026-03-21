/**
 * Absolute URL for tRPC (`/api/trpc`). Uses env only — no hardcoded hosts in source.
 *
 * - `NEXT_PUBLIC_APP_URL` is embedded in the client bundle (set in Vercel or `.env.local`).
 * - `AUTH_URL` is the same public origin when you do not duplicate `NEXT_PUBLIC_*`.
 * - `VERCEL_URL` is set automatically on Vercel (`https://${VERCEL_URL}`).
 *
 * If a build accidentally bakes in `localhost` for `NEXT_PUBLIC_*` while deploying to Vercel,
 * prefer `VERCEL_URL` so the browser does not cross-origin to localhost (CORS failure).
 *
 * If nothing resolves, falls back to relative `/api/trpc` (same-origin in the browser).
 */

function isLocalhostOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

export function getTrpcHttpUrl(): string {
  const vercelHttps = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    vercelHttps;
  let origin = raw.replace(/\/$/, "");
  // Only on Vercel’s production runtime: wrong NEXT_PUBLIC_* (localhost) → use deployment host.
  if (
    process.env.VERCEL === "1" &&
    process.env.NODE_ENV === "production" &&
    (!origin || isLocalhostOrigin(origin))
  ) {
    const v = vercelHttps.replace(/\/$/, "");
    if (v) origin = v;
  }
  if (!origin) return "/api/trpc";
  return `${origin}/api/trpc`;
}
