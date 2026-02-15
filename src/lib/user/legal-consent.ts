import { prisma } from "@/lib/db/prisma";
import { getSiteSettings } from "@/lib/tenant/site-settings";

export type LegalConsentStatus = {
  termsUpdatedAt: string;
  privacyUpdatedAt: string;
  termsAcceptedVersion: string | null;
  privacyAcceptedVersion: string | null;
  needsTermsAcceptance: boolean;
  needsPrivacyAcceptance: boolean;
};

export async function getLegalConsentStatus(params: {
  tenantId: string;
  userId: string;
}): Promise<LegalConsentStatus> {
  const [settings, user] = await Promise.all([
    getSiteSettings(params.tenantId),
    prisma.user.findFirst({
      where: { id: params.userId, tenantId: params.tenantId },
      select: {
        termsAcceptedVersion: true,
        privacyAcceptedVersion: true,
        termsAcceptedAt: true,
        privacyAcceptedAt: true,
      },
    }),
  ]);

  // If the user isn't found in this tenant, treat as needing acceptance.
  const termsAcceptedVersion = user?.termsAcceptedVersion ?? null;
  const privacyAcceptedVersion = user?.privacyAcceptedVersion ?? null;

  const needsTermsAcceptance =
    !user?.termsAcceptedAt || termsAcceptedVersion !== settings.termsUpdatedAt;
  const needsPrivacyAcceptance =
    !user?.privacyAcceptedAt ||
    privacyAcceptedVersion !== settings.privacyUpdatedAt;

  return {
    termsUpdatedAt: settings.termsUpdatedAt,
    privacyUpdatedAt: settings.privacyUpdatedAt,
    termsAcceptedVersion,
    privacyAcceptedVersion,
    needsTermsAcceptance,
    needsPrivacyAcceptance,
  };
}

