"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [legalLoading, setLegalLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsText, setTermsText] = useState<string>("");
  const [privacyText, setPrivacyText] = useState<string>("");
  const [termsUpdatedAt, setTermsUpdatedAt] = useState<string>("");
  const [privacyUpdatedAt, setPrivacyUpdatedAt] = useState<string>("");
  const [termsViewed, setTermsViewed] = useState(false);
  const [privacyViewed, setPrivacyViewed] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  async function ensureLegalLoaded() {
    if (termsText && privacyText) return;
    setLegalLoading(true);
    try {
      const res = await fetch("/api/public/legal", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as {
        termsText: string;
        termsUpdatedAt: string;
        privacyText: string;
        privacyUpdatedAt: string;
      };
      setTermsText(data.termsText ?? "");
      setPrivacyText(data.privacyText ?? "");
      setTermsUpdatedAt(data.termsUpdatedAt ?? "");
      setPrivacyUpdatedAt(data.privacyUpdatedAt ?? "");
    } finally {
      setLegalLoading(false);
    }
  }

  async function openTerms() {
    await ensureLegalLoaded();
    setTermsOpen(true);
  }

  async function openPrivacy() {
    await ensureLegalLoaded();
    setPrivacyOpen(true);
  }

  function onScrollToBottom(e: React.UIEvent<HTMLDivElement>, type: "terms" | "privacy") {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (!nearBottom) return;
    if (type === "terms") setTermsViewed(true);
    if (type === "privacy") setPrivacyViewed(true);
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptTerms || !acceptPrivacy) {
      setError("利用規約とプライバシーポリシーの確認・同意が必要です");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          inviteCode: inviteCode.trim() || undefined,
          acceptTerms,
          acceptPrivacy,
          termsUpdatedAt: termsUpdatedAt || undefined,
          privacyUpdatedAt: privacyUpdatedAt || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("登録は完了しましたが、自動ログインに失敗しました");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-1">
          <span className="bg-gradient-to-r from-gold-start to-gold-end bg-clip-text text-transparent">
            ORIPA
          </span>
        </h1>
        <p className="text-center text-gray-400 text-sm mb-8">
          新規アカウント登録
        </p>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="ニックネーム"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 px-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          />
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 px-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          />
          <input
            type="password"
            placeholder="パスワード（8文字以上、英数字）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="h-12 px-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          />
          <input
            type="text"
            placeholder="招待コード（任意）"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="h-12 px-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          />

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3 space-y-2">
            <p className="text-xs text-gray-400">
              登録前に必ずご確認ください
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 h-10 rounded-lg border border-gray-700 bg-gray-800 text-sm text-white hover:bg-gray-700 transition-colors disabled:opacity-60"
                onClick={openTerms}
                disabled={legalLoading}
              >
                利用規約を読む
              </button>
              <button
                type="button"
                className="flex-1 h-10 rounded-lg border border-gray-700 bg-gray-800 text-sm text-white hover:bg-gray-700 transition-colors disabled:opacity-60"
                onClick={openPrivacy}
                disabled={legalLoading}
              >
                プラポリを読む
              </button>
            </div>

            <label className="flex items-start gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                className="mt-0.5"
                disabled={!termsViewed}
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <span>
                <Link href="/terms" className="underline" target="_blank">
                  利用規約
                </Link>
                （{termsUpdatedAt || "—"}）を確認し同意します
                {!termsViewed ? (
                  <span className="text-gray-500">（先に「利用規約を読む」から最後までスクロール）</span>
                ) : null}
              </span>
            </label>

            <label className="flex items-start gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                className="mt-0.5"
                disabled={!privacyViewed}
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
              />
              <span>
                <Link href="/privacy" className="underline" target="_blank">
                  プライバシーポリシー
                </Link>
                （{privacyUpdatedAt || "—"}）を確認し同意します
                {!privacyViewed ? (
                  <span className="text-gray-500">（先に「プラポリを読む」から最後までスクロール）</span>
                ) : null}
              </span>
            </label>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "登録中..." : "登録する"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          既にアカウントをお持ちの方は{" "}
          <Link
            href="/login"
            className="text-yellow-400 hover:text-yellow-300"
          >
            ログイン
          </Link>
        </p>

        <p className="text-xs text-gray-600 text-center mt-4">
          登録には利用規約・プライバシーポリシーへの同意が必要です。
        </p>
      </div>

      <Modal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        className="max-w-2xl"
      >
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">利用規約</h2>
              <p className="text-xs text-gray-500">最終更新日: {termsUpdatedAt || "—"}</p>
            </div>
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-white"
              onClick={() => setTermsOpen(false)}
            >
              閉じる
            </button>
          </div>

          <div
            className="mt-4 h-[60vh] overflow-y-auto rounded-lg border border-gray-800 bg-black/20 p-4 text-sm leading-relaxed text-gray-200 whitespace-pre-wrap"
            onScroll={(e) => onScrollToBottom(e, "terms")}
          >
            {termsText || "読み込み中..."}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              最後までスクロールすると同意チェックが有効になります。
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setTermsOpen(false)}
            >
              閉じる
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        className="max-w-2xl"
      >
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">プライバシーポリシー</h2>
              <p className="text-xs text-gray-500">最終更新日: {privacyUpdatedAt || "—"}</p>
            </div>
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-white"
              onClick={() => setPrivacyOpen(false)}
            >
              閉じる
            </button>
          </div>

          <div
            className="mt-4 h-[60vh] overflow-y-auto rounded-lg border border-gray-800 bg-black/20 p-4 text-sm leading-relaxed text-gray-200 whitespace-pre-wrap"
            onScroll={(e) => onScrollToBottom(e, "privacy")}
          >
            {privacyText || "読み込み中..."}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              最後までスクロールすると同意チェックが有効になります。
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPrivacyOpen(false)}
            >
              閉じる
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
