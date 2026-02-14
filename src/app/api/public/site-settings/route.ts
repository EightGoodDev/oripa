import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/tenant/site-settings";

export async function GET() {
  const settings = await getSiteSettings();

  return NextResponse.json({
    operatorName: settings.operatorName,
    supportEmail: settings.supportEmail,
    supportHours: settings.supportHours,
  });
}

