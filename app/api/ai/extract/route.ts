import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { runGroqExtraction } from "@/lib/extraction";
import { writeAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "analyst" && session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as { text?: string; companyId?: string };
  const text = body.text?.trim() ?? "";
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  try {
    const result = await runGroqExtraction(text);
    if (body.companyId) {
      await writeAudit({
        actorId: session.user.id,
        action: "extraction_run",
        targetType: "company",
        targetId: body.companyId,
      }).catch(() => {});
    }
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
