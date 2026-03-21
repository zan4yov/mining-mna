/**
 * Absolute URL for tRPC (`/api/trpc`). Uses env only — no hardcoded hosts in source.
 *
 * - `NEXT_PUBLIC_APP_URL` is embedded in the client bundle (set in Vercel or `.env.local`).
 * - `AUTH_URL` is the same public origin when you do not duplicate `NEXT_PUBLIC_*`.
 * - `VERCEL_URL` is set automatically on Vercel.
 *
 * If nothing is set, falls back to relative `/api/trpc` (same-origin in the browser).
 */

export function getTrpcHttpUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const origin = raw.replace(/\/$/, "");
  if (!origin) return "/api/trpc";
  return `${origin}/api/trpc`;
}
