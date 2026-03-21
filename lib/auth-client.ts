import { signOut as nextAuthSignOut } from "next-auth/react";

/**
 * Sign out and land on /login on the **current** browser origin.
 *
 * NextAuth's default `signOut({ redirect: true })` prefers `data.url` from the server, which
 * can point at the wrong host if env URLs don't match deployment. We call `redirect: false`,
 * then navigate to `${origin}/login` so the tab always stays on the same host.
 */
export async function signOutToLogin() {
  if (typeof window === "undefined") {
    await nextAuthSignOut({ redirect: false });
    return;
  }
  await nextAuthSignOut({ redirect: false });
  window.location.assign(`${window.location.origin}/login`);
}
