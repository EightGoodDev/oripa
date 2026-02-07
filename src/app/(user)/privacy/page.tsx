export const metadata = {
  title: "プライバシーポリシー - ORIPA",
};

export default function PrivacyPage() {
  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-white mb-6">プライバシーポリシー</h1>
      <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">1. 収集する情報</h2>
          <p>
            本サービスでは、以下の情報を収集します。
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>アカウント情報（メールアドレス、表示名）</li>
            <li>決済情報（決済処理に必要な情報。クレジットカード情報は決済代行会社が管理します）</li>
            <li>利用履歴（抽選履歴、コイン取引履歴）</li>
            <li>端末情報（IPアドレス、ブラウザ情報）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">2. 情報の利用目的</h2>
          <p>
            収集した情報は以下の目的で利用します。
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>本サービスの提供・運営</li>
            <li>ユーザー認証・アカウント管理</li>
            <li>決済処理</li>
            <li>お問い合わせ対応</li>
            <li>サービスの改善・新機能の開発</li>
            <li>不正行為の防止</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">3. 第三者への提供</h2>
          <p>
            以下の場合を除き、個人情報を第三者に提供しません。
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>決済処理に必要な場合（決済代行会社への情報提供）</li>
            <li>景品発送に必要な場合（配送業者への情報提供）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">4. 情報の管理</h2>
          <p>
            個人情報の漏洩・滅失・毀損を防止するため、適切なセキュリティ対策を講じます。
            SSL/TLS暗号化通信を使用し、データは安全に管理されます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">5. Cookieの使用</h2>
          <p>
            本サービスではセッション管理のためにCookieを使用します。
            ブラウザの設定によりCookieを無効化できますが、本サービスの一部機能が利用できなくなる場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">6. 個人情報の開示・訂正・削除</h2>
          <p>
            ユーザーは自身の個人情報について、開示・訂正・削除を請求することができます。
            ご希望の場合はお問い合わせフォームよりご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mt-6 mb-2">7. ポリシーの変更</h2>
          <p>
            本ポリシーは必要に応じて変更することがあります。
            重要な変更がある場合はサービス上で通知します。
          </p>
        </section>

        <p className="text-xs text-gray-500 mt-8">最終更新日: 2026年2月7日</p>
      </div>
    </div>
  );
}
