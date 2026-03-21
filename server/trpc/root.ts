import { createTRPCRouter } from "@/server/trpc";
import { companyRouter } from "./routers/company";
import { snapshotRouter } from "./routers/snapshot";
import { userRouter } from "./routers/user";
import { adminRouter } from "./routers/admin";

export const appRouter = createTRPCRouter({
  company: companyRouter,
  snapshot: snapshotRouter,
  user: userRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
