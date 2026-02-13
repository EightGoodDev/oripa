import Link from "next/link";
import { redirect } from "next/navigation";
import Breadcrumb from "@/components/admin/Breadcrumb";
import SetupGuideCard from "@/components/admin/SetupGuideCard";
import { getAdminSetupStatus } from "@/lib/admin/setup";
import { auth } from "@/lib/auth";

export default async function AdminGetStartedPage() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) {
    redirect("/admin/login");
  }

  const setup = await getAdminSetupStatus(tenantId);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "初期セットアップ" }]} />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">初期セットアップガイド</h1>
        <p className="text-sm text-gray-400">
          空の状態から最短で公開運営に入るための必須設定を順番に進めます。
        </p>
      </div>

      <SetupGuideCard status={setup} />

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-3">
        <h2 className="text-lg font-semibold">現在の登録件数</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-3">
            <p className="text-gray-400">カテゴリ</p>
            <p className="text-xl font-semibold">{setup.counts.categories}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-3">
            <p className="text-gray-400">景品</p>
            <p className="text-xl font-semibold">{setup.counts.prizes}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-3">
            <p className="text-gray-400">パック</p>
            <p className="text-xl font-semibold">{setup.counts.packs}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-3">
            <p className="text-gray-400">パック景品紐付</p>
            <p className="text-xl font-semibold">{setup.counts.packPrizes}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-3">
            <p className="text-gray-400">公開パック</p>
            <p className="text-xl font-semibold">{setup.counts.activePacks}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-3">
            <p className="text-gray-400">有効課金プラン</p>
            <p className="text-xl font-semibold">{setup.counts.activePlans}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-2">
        <h2 className="text-lg font-semibold">推奨運用フロー</h2>
        <ol className="space-y-1 text-sm text-gray-300 list-decimal list-inside">
          <li>サイト設定で運営情報・規約を登録</li>
          <li>カテゴリ作成後、景品登録</li>
          <li>パック作成と景品紐付け、最後にACTIVE化</li>
          <li>課金プランを有効化して公開開始</li>
        </ol>
        <Link
          href="/admin/dashboard"
          prefetch={false}
          className="inline-block text-sm text-gold-mid hover:text-gold-end mt-2"
        >
          ダッシュボードへ戻る
        </Link>
      </section>
    </div>
  );
}
