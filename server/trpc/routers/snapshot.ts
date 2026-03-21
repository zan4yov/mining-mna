import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createTRPCRouter, analystProcedure } from "@/server/trpc";
import { db } from "@/server/db";
import { snapshots } from "@/server/db/schema";
import { snapshotParamsSchema } from "@/lib/validations";
import { computeSnapshotOutputs } from "@/lib/calculations";
import { paramsToDb } from "@/lib/mappers";
import { writeAudit } from "@/lib/audit";

export const snapshotRouter = createTRPCRouter({
  listByCompany: analystProcedure
    .input(z.object({ companyId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(snapshots)
        .where(eq(snapshots.companyId, input.companyId))
        .orderBy(desc(snapshots.date), desc(snapshots.createdAt));
    }),

  save: analystProcedure
    .input(
      z.object({
        companyId: z.string().uuid(),
        params: snapshotParamsSchema,
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const p = input.params;
      const out = computeSnapshotOutputs(p);
      const base = paramsToDb(p);
      const [row] = await db
        .insert(snapshots)
        .values({
          companyId: input.companyId,
          analystId: ctx.user.id,
          date: new Date(),
          ...base,
          npv: String(out.npv),
          irr: String(out.irr),
          payback: String(out.payback),
          bearNpv: String(out.bearNpv),
          bullNpv: String(out.bullNpv),
          ddScore: String(out.ddScore),
          synergy: String(out.synergy),
          recommendation: out.recommendation,
          notes: input.notes ?? null,
        })
        .returning();

      await writeAudit({
        actorId: ctx.user.id,
        action: "snapshot_saved",
        targetType: "snapshot",
        targetId: row.id,
        metadata: { companyId: input.companyId, npv: out.npv },
      });

      return row;
    }),
});
