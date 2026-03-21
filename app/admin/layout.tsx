import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-admin-canvas font-sans text-admin-text">
      <header className="flex items-center justify-between border-b border-admin-border bg-admin-surface px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-semibold text-admin-primary">
            🛡 M&amp;A Admin
          </Link>
          <nav className="flex gap-4 text-sm text-admin-muted">
            <Link href="/admin" className="hover:text-admin-text">
              Dashboard
            </Link>
            <Link href="/admin/users" className="hover:text-admin-text">
              Users
            </Link>
          </nav>
        </div>
      </header>
      <div className="p-6">{children}</div>
    </div>
  );
}
