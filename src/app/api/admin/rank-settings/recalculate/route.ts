import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { resolveTenantId } from "@/lib/tenant/context";
import { recalculateAllUserRanks } from "@/lib/rewards/recalculate";

export async function POST() {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const tenantId = await resolveTenantId();
  const summary = await recalculateAllUserRanks(tenantId);

  return NextResponse.json({ success: true, summary });
}
