import { prisma } from "@/lib/db/prisma";
import { SITE_SETTING_KEYS } from "@/lib/tenant/site-settings";

export interface AdminSetupStep {
  key:
    | "siteSettings"
    | "categories"
    | "prizes"
    | "packs"
    | "packPrizes"
    | "activePack"
    | "plans"
    | "homeVisual";
  title: string;
  description: string;
  href: string;
  required: boolean;
  completed: boolean;
}

export interface AdminSetupStatus {
  steps: AdminSetupStep[];
  completedRequiredCount: number;
  totalRequiredCount: number;
  percent: number;
  isReadyForLaunch: boolean;
  nextStep: Pick<AdminSetupStep, "title" | "href"> | null;
  counts: {
    siteSettingsConfiguredCount: number;
    categories: number;
    prizes: number;
    packs: number;
    packPrizes: number;
    activePacks: number;
    activePlans: number;
    publishedBanners: number;
    publishedEvents: number;
  };
}

const REQUIRED_SITE_SETTING_KEYS = [
  SITE_SETTING_KEYS.operatorName,
  SITE_SETTING_KEYS.supportEmail,
  SITE_SETTING_KEYS.termsText,
  SITE_SETTING_KEYS.privacyText,
] as const;

export async function getAdminSetupStatus(
  tenantId: string,
): Promise<AdminSetupStatus> {
  const [
    siteOverrides,
    categories,
    prizes,
    packs,
    packPrizes,
    activePacks,
    activePlans,
    publishedBanners,
    publishedEvents,
  ] = await Promise.all([
    prisma.tenantContentOverride.findMany({
      where: {
        tenantId,
        isPublished: true,
        key: { in: Array.from(REQUIRED_SITE_SETTING_KEYS) },
      },
      select: { key: true, value: true },
    }),
    prisma.packCategory.count({ where: { tenantId, isActive: true } }),
    prisma.prize.count({ where: { tenantId } }),
    prisma.oripaPack.count({ where: { tenantId } }),
    prisma.packPrize.count({ where: { tenantId } }),
    prisma.oripaPack.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.chargePlan.count({ where: { tenantId, isActive: true } }),
    prisma.homeBanner.count({
      where: { tenantId, isPublished: true, isActive: true },
    }),
    prisma.homeEvent.count({
      where: { tenantId, isPublished: true, isActive: true },
    }),
  ]);

  const configuredSiteSettingKeys = new Set(
    siteOverrides
      .filter((row) => row.value.trim().length > 0)
      .map((row) => row.key),
  );
  const siteSettingsConfiguredCount = REQUIRED_SITE_SETTING_KEYS.filter((key) =>
    configuredSiteSettingKeys.has(key),
  ).length;

  const steps: AdminSetupStep[] = [
    {
      key: "siteSettings",
      title: "運営情報と規約を設定",
      description: "特商法・利用規約・プライバシーポリシーを登録",
      href: "/admin/site-settings",
      required: true,
      completed: siteSettingsConfiguredCount === REQUIRED_SITE_SETTING_KEYS.length,
    },
    {
      key: "categories",
      title: "カテゴリを作成",
      description: "パックを整理するタブカテゴリを準備",
      href: "/admin/categories",
      required: true,
      completed: categories > 0,
    },
    {
      key: "prizes",
      title: "景品を登録",
      description: "出現候補となる景品データを追加",
      href: "/admin/prizes/new",
      required: true,
      completed: prizes > 0,
    },
    {
      key: "packs",
      title: "パックを作成",
      description: "販売するガチャパックを作成",
      href: "/admin/packs/new",
      required: true,
      completed: packs > 0,
    },
    {
      key: "packPrizes",
      title: "パックに景品を紐づけ",
      description: "排出比率・在庫を設定して抽選可能にする",
      href: "/admin/packs",
      required: true,
      completed: packPrizes > 0,
    },
    {
      key: "activePack",
      title: "公開パックを1つ以上用意",
      description: "ステータスをACTIVEにしてユーザー公開",
      href: "/admin/packs",
      required: true,
      completed: activePacks > 0,
    },
    {
      key: "plans",
      title: "課金プランを作成",
      description: "ユーザーがコイン購入できるプランを登録",
      href: "/admin/plans",
      required: true,
      completed: activePlans > 0,
    },
    {
      key: "homeVisual",
      title: "ホーム訴求を設定（任意）",
      description: "バナーまたはイベントでトップ訴求を追加",
      href: "/admin/banners",
      required: false,
      completed: publishedBanners > 0 || publishedEvents > 0,
    },
  ];

  const requiredSteps = steps.filter((step) => step.required);
  const completedRequiredCount = requiredSteps.filter((step) => step.completed).length;
  const totalRequiredCount = requiredSteps.length;
  const percent =
    totalRequiredCount === 0
      ? 100
      : Math.round((completedRequiredCount / totalRequiredCount) * 100);
  const isReadyForLaunch = completedRequiredCount === totalRequiredCount;
  const nextStep = steps.find((step) => step.required && !step.completed) ?? null;

  return {
    steps,
    completedRequiredCount,
    totalRequiredCount,
    percent,
    isReadyForLaunch,
    nextStep: nextStep ? { title: nextStep.title, href: nextStep.href } : null,
    counts: {
      siteSettingsConfiguredCount,
      categories,
      prizes,
      packs,
      packPrizes,
      activePacks,
      activePlans,
      publishedBanners,
      publishedEvents,
    },
  };
}
