import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/** Valid-shaped URL for build-time import; set DATABASE_URL for real connections. No loopback literal. */
const url =
  process.env.DATABASE_URL ??
  "postgresql://build:build@db.invalid/build?sslmode=require";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set — using placeholder for build only.");
}

const sql = neon(url);
export const db = drizzle(sql, { schema });
