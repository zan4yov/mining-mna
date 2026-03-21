import { db } from "@/server/db";
import { auditLog } from "@/server/db/schema";

export type AuditAction =
  | "user_created"
  | "user_updated"
  | "user_deactivated"
  | "user_reactivated"
  | "user_deleted"
  | "password_reset"
  | "login_success"
  | "login_failed"
  | "snapshot_saved"
  | "company_created"
  | "document_uploaded"
  | "extraction_run";

export async function writeAudit(params: {
  actorId: string;
  action: AuditAction;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}) {
  await db.insert(auditLog).values({
    actorId: params.actorId,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId ?? null,
    metadata: params.metadata ?? null,
    ipAddress: params.ipAddress ?? null,
  });
}
