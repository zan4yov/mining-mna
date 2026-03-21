import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "executive") redirect("/executive");
  if (session.user.role === "super_admin") redirect("/admin");
  redirect("/analyst");
}
