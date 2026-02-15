import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { resolveTenantId } from "@/lib/tenant/context";
import { prisma } from "@/lib/db/prisma";
import { getLegalConsentStatus } from "@/lib/user/legal-consent";

const acceptSchema = z.object({
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  termsUpdatedAt: z.string().trim().min(1).max(32),
  privacyUpdatedAt: z.string().trim().min(1).max(32),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await resolveTenantId();
  const status = await getLegalConsentStatus({ tenantId, userId: session.user.id });

  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = acceptSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();
  const status = await getLegalConsentStatus({ tenantId, userId: session.user.id });

  // If legal docs were updated after the user loaded them, require reload.
  if (
    parsed.data.termsUpdatedAt !== status.termsUpdatedAt ||
    parsed.data.privacyUpdatedAt !== status.privacyUpdatedAt
  ) {
    return NextResponse.json(
      {
        error:
          "利用規約またはプライバシーポリシーが更新されました。最新内容を確認して同意してください。",
        termsUpdatedAt: status.termsUpdatedAt,
        privacyUpdatedAt: status.privacyUpdatedAt,
      },
      { status: 409 },
    );
  }

  const now = new Date();
  await prisma.user.updateMany({
    where: { id: session.user.id, tenantId },
    data: {
      termsAcceptedVersion: status.termsUpdatedAt,
      termsAcceptedAt: now,
      privacyAcceptedVersion: status.privacyUpdatedAt,
      privacyAcceptedAt: now,
    },
  });

  const next = await getLegalConsentStatus({ tenantId, userId: session.user.id });
  return NextResponse.json(next);
}

