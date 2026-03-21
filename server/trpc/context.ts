import { auth } from "@/server/auth";

export async function createTRPCContext() {
  const session = await auth();
  return { session };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
