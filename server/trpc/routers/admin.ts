import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createTRPCRouter, adminProcedure } from "@/server/trpc";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { writeAudit } from "@/lib/audit";

export const adminRouter = createTRPCRouter({
  listUsers: adminProcedure.query(async () => {
    return db.select().from(users).orderBy(users.createdAt);
  }),

  createUser: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["super_admin", "analyst", "executive"]),
        team: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hash = await bcrypt.hash(input.password, 10);
      const [row] = await db
        .insert(users)
        .values({
          name: input.name,
          email: input.email.toLowerCase(),
          password: hash,
          role: input.role,
          team: input.team,
          createdBy: ctx.user.id,
        })
        .returning();
      await writeAudit({
        actorId: ctx.user.id,
        action: "user_created",
        targetType: "user",
        targetId: row.id,
        metadata: { email: row.email },
      });
      return row;
    }),

  setActive: adminProcedure
    .input(z.object({ userId: z.string().uuid(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(users)
        .set({ isActive: input.isActive, updatedAt: new Date() })
        .where(eq(users.id, input.userId));
      await writeAudit({
        actorId: ctx.user.id,
        action: input.isActive ? "user_reactivated" : "user_deactivated",
        targetType: "user",
        targetId: input.userId,
      });
      return { ok: true };
    }),
});
