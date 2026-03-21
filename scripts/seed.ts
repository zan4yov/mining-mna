import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { users, companies } from "../server/db/schema";

async function main() {
  const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@local.test")).limit(1);
  if (existingAdmin.length > 0) {
    console.log("Database already seeded — skipping.");
    return;
  }

  const adminHash = await bcrypt.hash("Admin123!", 10);
  const analystHash = await bcrypt.hash("team123", 10);
  const execHash = await bcrypt.hash("board456", 10);

  const [admin] = await db
    .insert(users)
    .values({
      name: "Super Admin",
      email: "admin@local.test",
      password: adminHash,
      role: "super_admin",
      team: "IT",
      isActive: true,
    })
    .returning();

  const adminId = admin.id;

  const [analyst] = await db
    .insert(users)
    .values({
      name: "Budi Santoso",
      email: "analyst@local.test",
      password: analystHash,
      role: "analyst",
      team: "M&A Team",
      createdBy: adminId,
    })
    .returning();

  await db.insert(users).values({
    name: "Pak Direktur",
    email: "exec@local.test",
    password: execHash,
    role: "executive",
    team: "Board",
    createdBy: adminId,
  });

  await db.insert(companies).values([
    {
      name: "PT Mineral Sejahtera Nusantara",
      ticker: "MSN",
      location: "Kalimantan Timur",
      type: "Thermal Coal",
      iup: "IUP-2024-KT-0081",
      entityType: "PT Mineral Sejahtera Nusantara (MSN)",
      listedOn: "IDX",
      mineralClass: "Thermal Coal GAR 4,500–6,600",
      shareGov: 30,
      sharePublic: 51,
      shareForeign: 19,
      status: "active",
      createdBy: analyst.id,
    },
    {
      name: "PT Bara Kencana Energi",
      ticker: "BKE",
      location: "Kalimantan Selatan",
      type: "Thermal Coal",
      iup: "IUP-2023-KS-0045",
      entityType: "PT Bara Kencana Energi (BKE)",
      listedOn: "IDX",
      mineralClass: "Thermal Coal GAR 4,000–5,800",
      shareGov: 0,
      sharePublic: 65,
      shareForeign: 35,
      status: "watchlist",
      createdBy: analyst.id,
    },
  ]);

  console.log("Seed complete. Users: admin@local.test, analyst@local.test, exec@local.test");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
