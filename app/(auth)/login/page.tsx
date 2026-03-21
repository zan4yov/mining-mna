"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("analyst@local.test");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setErr(res.error === "CredentialsSignin" ? "Invalid credentials" : res.error);
      return;
    }
    router.refresh();
    router.push("/");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#eef1ff] via-[#f5f7ff] to-[#ede9ff] px-4 font-sans">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary-border bg-primary-bg text-lg">
            ⛏
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-text-primary">Mining M&amp;A</div>
            <div className="text-[10px] uppercase tracking-[2.5px] text-text-dim">Intelligence Platform</div>
          </div>
        </div>
        <Badge variant="warn" className="mb-6">
          Stage II · Enterprise
        </Badge>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErr("");
              }}
              className="mt-1.5 font-mono tracking-widest"
            />
            {err ? <p className="mt-1 text-[10px] text-danger">{err}</p> : null}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </Button>
        </form>
        <p className="mt-6 text-center text-[10px] text-text-faint font-mono">CONFIDENTIAL · INTERNAL USE ONLY</p>
        <p className="mt-4 text-[10px] text-text-muted">
          Demo seed: analyst@local.test / team123 · exec@local.test / board456 · admin@local.test / Admin123!
        </p>
      </div>
    </div>
  );
}
