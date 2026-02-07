export const metadata = {
  title: "利用規約 - ORIPA",
};

export default function TermsPage() {
  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-white mb-6">利用規約</h1>
      <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">第1条（適用）</h2>
          <p>
            本利用規約（以下「本規約」）は、ORIPA（以下「本サービス」）の利用に関する条件を定めるものです。
            ユーザーは本規約に同意の上、本サービスをご利用ください。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">第2条（定義）</h2>
          <p>
            「ユーザー」とは、本サービスに登録し利用する個人を指します。
            「コイン」とは、本サービス内で使用できる仮想通貨を指します。
            「オリパ」とは、本サービス上で提供されるオリジナルパック商品を指します。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">第3条（登録）</h2>
          <p>
            本サービスの利用を希望する方は、所定の方法により利用登録を行うものとします。
            登録にあたり、正確かつ最新の情報を提供してください。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">第4条（コインの購入・利用）</h2>
          <p>
            ユーザーは所定の決済方法によりコインを購入できます。
            購入したコインはオリパの抽選に使用できます。
            コインの払い戻しは原則として行いません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">第5条（抽選について）</h2>
          <p>
            オリパの抽選は、各パックに設定された確率に基づいて行われます。
            すべての抽選で必ずいずれかの景品が当選します。
            お試し引きは実際のコイン消費・景品獲得を伴いません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">第6条（禁止事項）</h2>
          <p>
            ユーザーは以下の行為を行ってはなりません。
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>不正な方法によるコインの取得・利用</li>
            <li>本サービスの運営を妨げる行為</li>
            <li>他のユーザーの権利を侵害する行為</li>
            <li>法令または公序良俗に反する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">第7条（免責事項）</h2>
          <p>
            本サービスは現状のまま提供されます。
            当社は本サービスの利用により生じた損害について、故意または重大な過失がある場合を除き、責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">第8条（規約の変更）</h2>
          <p>
            当社は必要に応じて本規約を変更できるものとします。
            変更後の規約は本サービス上での掲載をもって効力を生じます。
          </p>
        </section>

        <p className="text-xs text-gray-500 mt-8">最終更新日: 2026年2月7日</p>
      </div>
    </div>
  );
}
