import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { resolveTenantId } from "@/lib/tenant/context";
import { publishConfigVersion } from "@/lib/tenant/config-version";

const schema = z.object({
  domain: z.enum(["RANKS", "HOME_BANNERS", "HOME_EVENTS", "MILE_REWARDS", "FEATURE_FLAGS", "CONTENT_OVERRIDES"]),
  description: z.string().max(500).optional(),
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

  const tenantId = await resolveTenantId();
  const version = await publishConfigVersion({
    tenantId,
    domain: parsed.data.domain,
    description: parsed.data.description,
    publishedBy: session.user?.id,
  });

  return NextResponse.json(version, { status: 201 });
}
