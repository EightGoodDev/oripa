import { NextRequest, NextResponse } from "next/server";
import type { ConfigDomain } from "@prisma/client";
import { requireAdmin } from "@/lib/admin/auth";
import { resolveTenantId } from "@/lib/tenant/context";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const tenantId = await resolveTenantId();
  const domainParam = req.nextUrl.searchParams.get("domain");
  const domain =
    domainParam &&
    [
      "RANKS",
      "HOME_BANNERS",
      "HOME_EVENTS",
      "MILE_REWARDS",
      "FEATURE_FLAGS",
      "CONTENT_OVERRIDES",
    ].includes(domainParam)
      ? domainParam
      : undefined;

  const rows = await prisma.tenantConfigVersion.findMany({
    where: {
      tenantId,
      ...(domain ? { domain: domain as ConfigDomain } : {}),
    },
    orderBy: [{ publishedAt: "desc" }],
    take: 100,
  });

  return NextResponse.json(rows);
}
