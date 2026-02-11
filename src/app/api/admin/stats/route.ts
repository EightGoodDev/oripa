import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminDashboardStats } from "@/lib/admin/stats";
import { resolveTenantId } from "@/lib/tenant/context";

export async function GET() {
  try {
    await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const tenantId = await resolveTenantId();
  const stats = await getAdminDashboardStats(tenantId);
  return NextResponse.json(stats);
}
