import Link from "next/link";

export default function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  return (
    <div>
      <Link href="/admin/users" className="text-sm text-admin-primary hover:underline">
        ← Back
      </Link>
      <h1 className="mt-4 text-xl font-bold">User {params.userId}</h1>
      <p className="mt-2 text-sm text-admin-muted">Detail view placeholder — extend with tRPC user.getById when needed.</p>
    </div>
  );
}
