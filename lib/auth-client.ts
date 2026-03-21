import { signOut as nextAuthSignOut } from "next-auth/react";

/**
 * Sign out and land on /login on the **current** browser origin.
 *
 * NextAuth's default `signOut({ redirect: true })` sets `window.location` to `data.url` from
 * the server first, which is built from AUTH_URL/NEXTAUTH_URL at build time and often becomes
 * `http://localhost:3000/login` in production. Using `redirect: false` clears the session via
 * POST, then we navigate ourselves so the host always matches.
 */
export async function signOutToLogin() {
  if (typeof window === "undefined") {
    await nextAuthSignOut({ redirect: false });
    return;
  }
  await nextAuthSignOut({ redirect: false });
  window.location.assign(`${window.location.origin}/login`);
}
