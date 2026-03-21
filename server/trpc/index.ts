import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TRPCContext } from "./context";

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

function roleGuard(roles: Array<"super_admin" | "analyst" | "executive">) {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const r = ctx.session.user.role;
    if (!roles.includes(r)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({ ctx: { ...ctx, user: ctx.session.user } });
  });
}

export const analystProcedure = t.procedure.use(enforceAuth).use(roleGuard(["analyst", "super_admin"]));
export const executiveProcedure = t.procedure.use(enforceAuth).use(roleGuard(["executive", "super_admin"]));
export const workspaceProcedure = t.procedure
  .use(enforceAuth)
  .use(roleGuard(["analyst", "executive", "super_admin"]));
export const adminProcedure = t.procedure.use(enforceAuth).use(roleGuard(["super_admin"]));
