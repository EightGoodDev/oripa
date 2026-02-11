export const metadata = {
  title: "運営者情報 - ORIPA",
};

function rowValue(value: string | undefined, fallback = "未設定") {
  return value && value.trim().length > 0 ? value : fallback;
}

export default function OperatorPage() {
  const operatorName = rowValue(process.env.NEXT_PUBLIC_OPERATOR_NAME, "ORIPA運営事務局");
  const operatorCompany = rowValue(process.env.NEXT_PUBLIC_OPERATOR_COMPANY);
  const operatorAddress = rowValue(process.env.NEXT_PUBLIC_OPERATOR_ADDRESS);
  const supportEmail = rowValue(
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    "support@oripa.example",
  );
  const supportHours = rowValue(
    process.env.NEXT_PUBLIC_SUPPORT_HOURS,
    "平日 10:00-18:00",
  );

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-white mb-6">運営者情報</h1>
      <div className="rounded-xl border border-gray-800 bg-gray-900/70 overflow-hidden">
        <dl className="divide-y divide-gray-800 text-sm">
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">運営者名</dt>
            <dd className="text-white">{operatorName}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">事業者名</dt>
            <dd className="text-white">{operatorCompany}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">所在地</dt>
            <dd className="text-white">{operatorAddress}</dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">連絡先</dt>
            <dd className="text-white break-all">
              <a href={`mailto:${supportEmail}`} className="text-blue-300 hover:text-blue-200 underline">
                {supportEmail}
              </a>
            </dd>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
            <dt className="text-gray-400">対応時間</dt>
            <dd className="text-white">{supportHours}</dd>
          </div>
        </dl>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        正式な販売条件・返品条件などは、利用規約およびプライバシーポリシーをご確認ください。
      </p>
    </div>
  );
}
