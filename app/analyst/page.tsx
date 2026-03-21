"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOutToLogin } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc";
import { CompanyCard } from "@/components/analyst/CompanyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AnalystHomePage() {
  const { data: session } = useSession();
  const list = trpc.company.list.useQuery();
  const create = trpc.company.create.useMutation();
  const utils = trpc.useUtils();

  return (
    <div className="min-h-screen bg-canvas font-sans text-text-primary">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-base font-extrabold tracking-tight text-primary">⛏ Mining M&amp;A</div>
          <Badge>Analyst Workspace</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold">{session?.user?.name}</div>
            <div className="text-[9px] text-text-faint">{session?.user?.team}</div>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOutToLogin()}>
            Sign out
          </Button>
        </div>
      </header>
      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold tracking-tight">Company Workspace</div>
            <div className="text-[11px] text-text-faint">AI extraction · 9-module valuation model · versioned snapshots</div>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              const c = await create.mutateAsync({
                name: "New Target Company",
                ticker: "NTC",
                location: "—",
                type: "Thermal Coal",
                iup: "—",
                entityType: "—",
                listedOn: "—",
                mineralClass: "—",
                shareGov: 0,
                sharePublic: 100,
                shareForeign: 0,
                status: "watchlist",
              });
              await utils.company.list.invalidate();
              window.location.href = `/analyst/${c.id}/calculator/1`;
            }}
          >
            + Add Target
          </Button>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
          {list.data?.map((co) => (
            <CompanyCard key={co.id} company={co} />
          ))}
        </div>
        {list.isLoading ? <p className="mt-4 text-sm text-text-muted">Loading companies…</p> : null}
      </div>
    </div>
  );
}
