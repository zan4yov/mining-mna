import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { writeAudit } from "@/lib/audit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString() ?? "";
        if (!email || !password) return null;

        const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!row) {
          return null;
        }
        if (!row.isActive) {
          throw new Error("Account is deactivated");
        }
        const ok = await bcrypt.compare(password, row.password);
        if (!ok) {
          await writeAudit({
            actorId: row.id,
            action: "login_failed",
            targetType: "user",
            targetId: row.id,
            metadata: { email },
          }).catch(() => {});
          return null;
        }

        await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, row.id));
        await writeAudit({
          actorId: row.id,
          action: "login_success",
          targetType: "user",
          targetId: row.id,
        }).catch(() => {});

        return {
          id: row.id,
          email: row.email,
          name: row.name,
          role: row.role,
          team: row.team,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: string }).role;
        token.team = (user as { team: string }).team;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "super_admin" | "analyst" | "executive";
        session.user.team = token.team as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
