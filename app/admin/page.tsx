import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "super_admin") redirect("/login");

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold">System Overview</h1>
      <p className="mb-6 max-w-2xl text-sm text-admin-muted">
        Super admin dashboard — manage users from the Users tab. Audit logging is recorded on login and snapshot saves.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {["Neon Postgres", "Auth.js", "tRPC API"].map((x) => (
          <div key={x} className="rounded-lg border border-admin-border bg-admin-surface p-4">
            <div className="text-xs uppercase tracking-wide text-admin-muted">Component</div>
            <div className="mt-1 font-mono text-sm font-semibold">{x}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
