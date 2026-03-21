"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminUsersPage() {
  const users = trpc.admin.listUsers.useQuery();
  const create = trpc.admin.createUser.useMutation();
  const setActive = trpc.admin.setActive.useMutation();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"analyst" | "executive" | "super_admin">("analyst");
  const [team, setTeam] = useState("M&A Team");

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">Users</h1>
      <p className="mb-4 max-w-2xl text-xs text-admin-muted">
        Everyone who can sign in is listed below. Passwords are never shown—only email, role, and active status. New users
        receive credentials out of band (not from this app’s repository).
      </p>
      <div className="mb-8 max-w-md rounded-lg border border-admin-border bg-admin-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-admin-muted">Create user</h2>
        <div className="space-y-2">
          <div>
            <Label>Name</Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <Label>Team</Label>
            <Input className="mt-1" value={team} onChange={(e) => setTeam(e.target.value)} />
          </div>
          <div>
            <Label>Role</Label>
            <select
              className="mt-1 w-full rounded-md border border-admin-border bg-admin-inset px-3 py-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
            >
              <option value="analyst">analyst</option>
              <option value="executive">executive</option>
              <option value="super_admin">super_admin</option>
            </select>
          </div>
          <Button
            className="mt-2 w-full"
            onClick={async () => {
              await create.mutateAsync({ name, email, password, role, team });
              setName("");
              setEmail("");
              setPassword("");
              await utils.admin.listUsers.invalidate();
            }}
          >
            Create
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-admin-border bg-admin-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-admin-border bg-admin-inset text-left text-xs uppercase text-admin-muted">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Active</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.data?.map((u) => (
              <tr key={u.id} className="border-b border-admin-border">
                <td className="p-3">{u.name}</td>
                <td className="p-3 font-mono text-xs">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.isActive ? "yes" : "no"}</td>
                <td className="p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await setActive.mutateAsync({ userId: u.id, isActive: !u.isActive });
                      await utils.admin.listUsers.invalidate();
                    }}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
