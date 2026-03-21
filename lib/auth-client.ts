import { signOut as nextAuthSignOut } from "next-auth/react";

/** Sign out and land on /login on the same origin (avoids wrong host from env during redirect). */
export function signOutToLogin() {
  if (typeof window !== "undefined") {
    return nextAuthSignOut({ callbackUrl: `${window.location.origin}/login` });
  }
  return nextAuthSignOut({ callbackUrl: "/login" });
}
