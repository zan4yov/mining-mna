/**
 * Optional one-time bootstrap: creates a single super_admin from environment variables only.
 * No demo users, companies, or passwords are stored in the repository.
 *
 * Set in your environment (e.g. Vercel secrets, then `vercel env pull` locally):
 *   SEED_ENABLE=true
 *   SEED_SUPER_ADMIN_EMAIL=...
 *   SEED_SUPER_ADMIN_PASSWORD=...
 * Optional: SEED_SUPER_ADMIN_NAME, SEED_SUPER_ADMIN_TEAM
 *
 * Remove SEED_* from production after the first user exists.
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { users } from "../server/db/schema";

async function main() {
  const enabled = process.env.SEED_ENABLE === "true" || process.env.SEED_ENABLE === "1";
  const email = process.env.SEED_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  const name = process.env.SEED_SUPER_ADMIN_NAME?.trim() || "Administrator";
  const team = process.env.SEED_SUPER_ADMIN_TEAM?.trim() || "IT";

  if (!enabled) {
    console.log(
      "Bootstrap skipped (set SEED_ENABLE=true with SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD to create the first super admin).",
    );
    return;
  }

  if (!email || !password) {
    console.error("SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD are required when SEED_ENABLE=true.");
    process.exit(1);
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    console.log("Bootstrap skipped: a user with that email already exists.");
    return;
  }

  const adminHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    name,
    email,
    password: adminHash,
    role: "super_admin",
    team,
    isActive: true,
  });

  console.log("Bootstrap complete: one super_admin created. Unset SEED_* secrets after verifying login.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
