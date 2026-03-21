"use client";

import { Button } from "@/components/ui/button";
import { signOutToLogin } from "@/lib/auth-client";

export function AdminSignOut() {
  return (
    <Button variant="outline" size="sm" onClick={() => signOutToLogin()}>
      Sign out
    </Button>
  );
}
