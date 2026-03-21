import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["super_admin", "analyst", "executive"]);
export const companyStatusEnum = pgEnum("company_status", ["active", "watchlist", "archived"]);
export const recommendationEnum = pgEnum("recommendation", ["proceed", "monitor", "avoid"]);
export const docTypeEnum = pgEnum("doc_type", [
  "annual_report",
  "geological",
  "iup",
  "financial",
  "other",
]);
export const auditActionEnum = pgEnum("audit_action", [
  "user_created",
  "user_updated",
  "user_deactivated",
  "user_reactivated",
  "user_deleted",
  "password_reset",
  "login_success",
  "login_failed",
  "snapshot_saved",
  "company_created",
  "document_uploaded",
  "extraction_run",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull(),
  team: text("team").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: uuid("created_by").references((): AnyPgColumn => users.id),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ticker: text("ticker").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  iup: text("iup").notNull(),
  entityType: text("entity_type").notNull(),
  listedOn: text("listed_on").notNull(),
  mineralClass: text("mineral_class").notNull(),
  shareGov: integer("share_gov").notNull(),
  sharePublic: integer("share_public").notNull(),
  shareForeign: integer("share_foreign").notNull(),
  status: companyStatusEnum("status").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const snapshots = pgTable("snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  analystId: uuid("analyst_id")
    .notNull()
    .references(() => users.id),
  date: timestamp("date", { mode: "date" }).notNull(),
  coalPrice: numeric("coal_price").notNull(),
  discRate: numeric("disc_rate").notNull(),
  annualProd: numeric("annual_prod").notNull(),
  mineLife: integer("mine_life").notNull(),
  cashCost: numeric("cash_cost").notNull(),
  royaltyRate: numeric("royalty_rate").notNull(),
  taxRate: numeric("tax_rate").notNull(),
  capex: numeric("capex").notNull(),
  measuredMt: numeric("measured_mt").notNull(),
  indicatedMt: numeric("indicated_mt").notNull(),
  inferredMt: numeric("inferred_mt").notNull(),
  measuredGar: integer("measured_gar").notNull(),
  indicatedGar: integer("indicated_gar").notNull(),
  inferredGar: integer("inferred_gar").notNull(),
  recoveryRate: numeric("recovery_rate").notNull(),
  stripRatio: numeric("strip_ratio").notNull(),
  haulingDist: numeric("hauling_dist").notNull(),
  bargeDist: numeric("barge_dist").notNull(),
  crushCost: numeric("crush_cost").notNull(),
  portHandling: numeric("port_handling").notNull(),
  acquisitionCost: numeric("acquisition_cost").notNull(),
  debtPct: numeric("debt_pct").notNull(),
  debtCost: numeric("debt_cost").notNull(),
  loanTenor: integer("loan_tenor").notNull(),
  sharedInfra: integer("shared_infra").notNull(),
  gaConsolidation: numeric("ga_consolidation").notNull(),
  procSavings: numeric("proc_savings").notNull(),
  iupValid: boolean("iup_valid").notNull(),
  certClean: boolean("cert_clean").notNull(),
  amdal: boolean("amdal").notNull(),
  ppa: boolean("ppa").notNull(),
  dmb: boolean("dmb").notNull(),
  npv: numeric("npv").notNull(),
  irr: numeric("irr").notNull(),
  payback: numeric("payback").notNull(),
  bearNpv: numeric("bear_npv").notNull(),
  bullNpv: numeric("bull_npv").notNull(),
  ddScore: numeric("dd_score").notNull(),
  synergy: numeric("synergy").notNull(),
  recommendation: recommendationEnum("recommendation").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => users.id),
  filename: text("filename").notNull(),
  blobUrl: text("blob_url").notNull(),
  docType: docTypeEnum("doc_type").notNull(),
  extracted: boolean("extracted").notNull().default(false),
  extractionResult: jsonb("extraction_result"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id),
  action: auditActionEnum("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  companiesCreated: many(companies),
  snapshots: many(snapshots),
  documents: many(documents),
  auditEntries: many(auditLog),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  creator: one(users, { fields: [companies.createdBy], references: [users.id] }),
  snapshots: many(snapshots),
  documents: many(documents),
}));

export const snapshotsRelations = relations(snapshots, ({ one }) => ({
  company: one(companies, { fields: [snapshots.companyId], references: [companies.id] }),
  analyst: one(users, { fields: [snapshots.analystId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type Snapshot = typeof snapshots.$inferSelect;
export type NewSnapshot = typeof snapshots.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type AuditLogRow = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
