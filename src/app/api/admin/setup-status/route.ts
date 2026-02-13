import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminSetupStatus } from "@/lib/admin/setup";

export async function GET() {
  let session;
  try {
    session = await requireAdmin();
  } catch (res) {
    return res as NextResponse;
  }

  const tenantId = session.user.tenantId;
  const status = await getAdminSetupStatus(tenantId);
  return NextResponse.json(status);
}
