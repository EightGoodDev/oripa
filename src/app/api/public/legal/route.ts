import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/tenant/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSiteSettings();

  return NextResponse.json({
    termsText: settings.termsText,
    termsUpdatedAt: settings.termsUpdatedAt,
    privacyText: settings.privacyText,
    privacyUpdatedAt: settings.privacyUpdatedAt,
  });
}

