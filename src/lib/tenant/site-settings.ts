import { prisma } from "@/lib/db/prisma";
import { resolveTenantId } from "@/lib/tenant/context";

export const SITE_SETTING_KEYS = {
  operatorName: "site.operator.name",
  operatorCompany: "site.operator.company",
  operatorAddress: "site.operator.address",
  operatorPhone: "site.operator.phone",
  secondhandDealerApproved: "site.legal.secondhandDealerApproved",
  secondhandDealerLicenseNumber: "site.legal.secondhandDealerLicenseNumber",
  secondhandDealerIssuingAuthority: "site.legal.secondhandDealerIssuingAuthority",
  supportEmail: "site.support.email",
  supportHours: "site.support.hours",
  representativeName: "site.legal.representative",
  businessDescription: "site.legal.businessDescription",
  paymentMethods: "site.legal.paymentMethods",
  servicePriceNote: "site.legal.servicePrice",
  additionalFees: "site.legal.additionalFees",
  deliveryTime: "site.legal.deliveryTime",
  returnPolicy: "site.legal.returnPolicy",
  termsText: "site.legal.terms",
  termsUpdatedAt: "site.legal.termsUpdatedAt",
  privacyText: "site.legal.privacy",
  privacyUpdatedAt: "site.legal.privacyUpdatedAt",
} as const;

export type SiteSettingField = keyof typeof SITE_SETTING_KEYS;

const SITE_SETTING_DEFAULTS: Record<SiteSettingField, string> = {
  operatorName:
    process.env.NEXT_PUBLIC_OPERATOR_NAME?.trim() || "ORIPA運営事務局",
  operatorCompany: process.env.NEXT_PUBLIC_OPERATOR_COMPANY?.trim() || "未設定",
  operatorAddress: process.env.NEXT_PUBLIC_OPERATOR_ADDRESS?.trim() || "未設定",
  operatorPhone: process.env.NEXT_PUBLIC_OPERATOR_PHONE?.trim() || "未設定",
  secondhandDealerApproved: "false",
  secondhandDealerLicenseNumber: "",
  secondhandDealerIssuingAuthority: "",
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@oripa.example",
  supportHours:
    process.env.NEXT_PUBLIC_SUPPORT_HOURS?.trim() || "平日 10:00-18:00",
  representativeName: "未設定",
  businessDescription: "デジタルコンテンツ提供およびオンライン抽選サービス",
  paymentMethods: "クレジットカード決済、その他当社が定める方法",
  servicePriceNote: "各商品・サービス画面に表示する価格",
  additionalFees: "インターネット接続に必要な通信料はお客様負担となります",
  deliveryTime: "決済完了後、即時または各サービス記載時期に提供します",
  returnPolicy: "デジタル商品の性質上、購入後の返品・返金は原則不可",
  termsText: `第1条（適用）
本利用規約（以下「本規約」）は、本サービスの利用条件を定めるものです。

第2条（登録）
ユーザーは必要事項を正確に登録し、本規約に同意のうえ利用します。

第3条（禁止事項）
不正アクセス、サービス妨害、法令違反、公序良俗違反行為を禁止します。

第4条（免責）
当社は、当社の故意または重過失がある場合を除き、損害賠償責任を負いません。`,
  termsUpdatedAt: "2026-02-12",
  privacyText: `1. 取得する情報
アカウント情報、利用履歴、決済に必要な情報、端末情報を取得します。

2. 利用目的
サービス提供、本人確認、決済処理、サポート対応、不正防止に利用します。

3. 第三者提供
法令に基づく場合等を除き、本人同意なく第三者提供しません。

4. 安全管理
不正アクセス・漏えい防止のため必要かつ適切な安全管理措置を講じます。`,
  privacyUpdatedAt: "2026-02-12",
};

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

async function loadOverrideMap(tenantId: string) {
  const keys = Object.values(SITE_SETTING_KEYS);
  const rows = await prisma.tenantContentOverride.findMany({
    where: {
      tenantId,
      isPublished: true,
      key: { in: keys },
    },
    select: {
      key: true,
      value: true,
    },
  });

  const map = new Map<string, string>();
  for (const row of rows) {
    map.set(row.key, row.value);
  }
  return map;
}

export async function getSiteSettings(tenantIdParam?: string) {
  const tenantId = tenantIdParam ?? (await resolveTenantId());
  const map = await loadOverrideMap(tenantId);

  const valueOf = (field: SiteSettingField) =>
    normalizeText(map.get(SITE_SETTING_KEYS[field])) ?? SITE_SETTING_DEFAULTS[field];

  const secondhandDealerApprovedRaw = valueOf("secondhandDealerApproved");
  const secondhandDealerApproved = secondhandDealerApprovedRaw === "true";

  return {
    operatorName: valueOf("operatorName"),
    operatorCompany: valueOf("operatorCompany"),
    operatorAddress: valueOf("operatorAddress"),
    operatorPhone: valueOf("operatorPhone"),
    secondhandDealerApproved,
    secondhandDealerLicenseNumber: valueOf("secondhandDealerLicenseNumber"),
    secondhandDealerIssuingAuthority: valueOf("secondhandDealerIssuingAuthority"),
    supportEmail: valueOf("supportEmail"),
    supportHours: valueOf("supportHours"),
    representativeName: valueOf("representativeName"),
    businessDescription: valueOf("businessDescription"),
    paymentMethods: valueOf("paymentMethods"),
    servicePriceNote: valueOf("servicePriceNote"),
    additionalFees: valueOf("additionalFees"),
    deliveryTime: valueOf("deliveryTime"),
    returnPolicy: valueOf("returnPolicy"),
    termsText: valueOf("termsText"),
    termsUpdatedAt: valueOf("termsUpdatedAt"),
    privacyText: valueOf("privacyText"),
    privacyUpdatedAt: valueOf("privacyUpdatedAt"),
  };
}
