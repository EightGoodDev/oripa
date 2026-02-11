import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { resolveTenantId } from "@/lib/tenant/context";
import { rollbackConfigVersion } from "@/lib/tenant/config-version";

const schema = z.object({
  domain: z.enum(["RANKS", "HOME_BANNERS", "HOME_EVENTS", "MILE_REWARDS", "FEATURE_FLAGS", "CONTENT_OVERRIDES"]),
  version: z.coerce.number().int().min(1),
});

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const tenantId = await resolveTenantId();
    const result = await rollbackConfigVersion({
      tenantId,
      domain: parsed.data.domain,
      version: parsed.data.version,
      publishedBy: session.user?.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "ロールバックに失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
