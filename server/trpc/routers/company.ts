import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createTRPCRouter, analystProcedure, workspaceProcedure } from "@/server/trpc";
import { db } from "@/server/db";
import { companies, snapshots } from "@/server/db/schema";
import { writeAudit } from "@/lib/audit";
import { rowToParams } from "@/lib/mappers";

export const companyRouter = createTRPCRouter({
  list: workspaceProcedure.query(async () => {
    const rows = await db.select().from(companies).orderBy(desc(companies.updatedAt));
    const out = [];
    for (const c of rows) {
      const snaps = await db
        .select()
        .from(snapshots)
        .where(eq(snapshots.companyId, c.id))
        .orderBy(desc(snapshots.date), desc(snapshots.createdAt));
      out.push({
        ...c,
        snapshots: snaps.map((s) => ({
          ...s,
          params: rowToParams(s),
        })),
      });
    }
    return out;
  }),

  get: workspaceProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
    const [c] = await db.select().from(companies).where(eq(companies.id, input.id)).limit(1);
    if (!c) return null;
    const snaps = await db
      .select()
      .from(snapshots)
      .where(eq(snapshots.companyId, c.id))
      .orderBy(desc(snapshots.date), desc(snapshots.createdAt));
    return {
      ...c,
      snapshots: snaps.map((s) => ({ ...s, params: rowToParams(s) })),
    };
  }),

  create: analystProcedure
    .input(
      z.object({
        name: z.string().min(1),
        ticker: z.string().min(1),
        location: z.string(),
        type: z.string(),
        iup: z.string(),
        entityType: z.string(),
        listedOn: z.string(),
        mineralClass: z.string(),
        shareGov: z.number().min(0).max(100),
        sharePublic: z.number().min(0).max(100),
        shareForeign: z.number().min(0).max(100),
        status: z.enum(["active", "watchlist", "archived"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await db
        .insert(companies)
        .values({
          ...input,
          createdBy: ctx.user.id,
        })
        .returning();
      await writeAudit({
        actorId: ctx.user.id,
        action: "company_created",
        targetType: "company",
        targetId: row.id,
      });
      return row;
    }),

  update: analystProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        ticker: z.string().optional(),
        location: z.string().optional(),
        type: z.string().optional(),
        iup: z.string().optional(),
        entityType: z.string().optional(),
        listedOn: z.string().optional(),
        mineralClass: z.string().optional(),
        shareGov: z.number().optional(),
        sharePublic: z.number().optional(),
        shareForeign: z.number().optional(),
        status: z.enum(["active", "watchlist", "archived"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const [row] = await db
        .update(companies)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(companies.id, id))
        .returning();
      return row;
    }),
});
