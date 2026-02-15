export const metadata = {
  title: "運営者情報 - ORIPA",
};

import { getSiteSettings } from "@/lib/tenant/site-settings";

export default async function OperatorPage() {
  const settings = await getSiteSettings();

  const hasSecondhandDetails =
    settings.secondhandDealerLicenseNumber.trim().length > 0 ||
    settings.secondhandDealerIssuingAuthority.trim().length > 0;

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-white mb-6">運営者情報</h1>
      <div className="rounded-xl border border-gray-800 bg-gray-900/70 overflow-hidden">
        <dl className="divide-y divide-gray-800 text-sm">
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">運営者名</dt>
            <dd className="text-white">{settings.operatorName}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">事業者名</dt>
            <dd className="text-white">{settings.operatorCompany}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">運営統括責任者</dt>
            <dd className="text-white">{settings.representativeName}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">所在地</dt>
            <dd className="text-white whitespace-pre-wrap">{settings.operatorAddress}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">電話番号</dt>
            <dd className="text-white">{settings.operatorPhone}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">古物商許可</dt>
            <dd className="text-white">
              {settings.secondhandDealerApproved ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-500/30 px-2 py-0.5 text-xs">
                    取得済み
                  </span>
                  {hasSecondhandDetails ? (
                    <span className="text-sm text-gray-200">
                      {settings.secondhandDealerIssuingAuthority}
                      {settings.secondhandDealerIssuingAuthority &&
                      settings.secondhandDealerLicenseNumber
                        ? " "
                        : ""}
                      {settings.secondhandDealerLicenseNumber}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-500/10 text-gray-200 border border-gray-600/40 px-2 py-0.5 text-xs">
                  未取得
                </span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">連絡先</dt>
            <dd className="text-white break-all">
              <a href={`mailto:${settings.supportEmail}`} className="text-blue-300 hover:text-blue-200 underline">
                {settings.supportEmail}
              </a>
            </dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">対応時間</dt>
            <dd className="text-white">{settings.supportHours}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">販売業務内容</dt>
            <dd className="text-white whitespace-pre-wrap">{settings.businessDescription}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">支払方法</dt>
            <dd className="text-white whitespace-pre-wrap">{settings.paymentMethods}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">販売価格</dt>
            <dd className="text-white whitespace-pre-wrap">{settings.servicePriceNote}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">追加料金</dt>
            <dd className="text-white whitespace-pre-wrap">{settings.additionalFees}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">引き渡し時期</dt>
            <dd className="text-white whitespace-pre-wrap">{settings.deliveryTime}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">返品・キャンセル</dt>
            <dd className="text-white whitespace-pre-wrap">{settings.returnPolicy}</dd>
          </div>
        </dl>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        詳細条件は利用規約・プライバシーポリシーをご確認ください。
      </p>
    </div>
  );
}
