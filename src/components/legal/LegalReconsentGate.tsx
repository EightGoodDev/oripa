"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

type ConsentStatus = {
  termsUpdatedAt: string;
  privacyUpdatedAt: string;
  needsTermsAcceptance: boolean;
  needsPrivacyAcceptance: boolean;
};

export default function LegalReconsentGate() {
  const router = useRouter();

  const [statusLoading, setStatusLoading] = useState(true);
  const [status, setStatus] = useState<ConsentStatus | null>(null);

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
  const [submitError, setSubmitError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const needsConsent =
    Boolean(status?.needsTermsAcceptance) || Boolean(status?.needsPrivacyAcceptance);

  useEffect(() => {
    void (async () => {
      setStatusLoading(true);
      try {
        const res = await fetch("/api/user/legal", { cache: "no-store" });
        if (!res.ok) {
          setStatus(null);
          return;
        }
        const data = (await res.json()) as ConsentStatus;
        setStatus(data);
      } finally {
        setStatusLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!needsConsent) return;
    void ensureLegalLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsConsent]);

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

  function onScrollToBottom(
    e: React.UIEvent<HTMLDivElement>,
    type: "terms" | "privacy",
  ) {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (!nearBottom) return;
    if (type === "terms") setTermsViewed(true);
    if (type === "privacy") setPrivacyViewed(true);
  }

  async function acceptAndContinue() {
    setSubmitError("");
    if (!acceptTerms || !acceptPrivacy) {
      setSubmitError("利用規約とプライバシーポリシーの確認・同意が必要です");
      return;
    }
    if (!termsUpdatedAt || !privacyUpdatedAt) {
      setSubmitError("規約情報の取得に失敗しました。再読み込みしてからお試しください。");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptTerms: true,
          acceptPrivacy: true,
          termsUpdatedAt,
          privacyUpdatedAt,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setSubmitError(body?.error ?? "同意の保存に失敗しました");
        if (res.status === 409) {
          // Legal updated while reading. Reload latest text and reset viewed flags.
          setTermsText("");
          setPrivacyText("");
          setTermsViewed(false);
          setPrivacyViewed(false);
          setAcceptTerms(false);
          setAcceptPrivacy(false);
          await ensureLegalLoaded();
        }
        return;
      }
      setStatus(body as ConsentStatus);
      router.refresh();
      // Hard reload ensures all client caches pick up the new status.
      window.location.reload();
    } catch {
      setSubmitError("同意の保存に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  if (statusLoading || !needsConsent) return null;

  return (
    <>
      <Modal isOpen={needsConsent} onClose={() => {}}>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white">重要なお知らせ</h2>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            利用規約・プライバシーポリシーが更新されました。内容をご確認の上、同意をお願いします。
          </p>

          <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950/40 p-3 space-y-2">
            <p className="text-xs text-gray-400">
              続行するには、最後までスクロールして同意してください
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
                  <span className="text-gray-500">
                    （先に「利用規約を読む」から最後までスクロール）
                  </span>
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
                  <span className="text-gray-500">
                    （先に「プラポリを読む」から最後までスクロール）
                  </span>
                ) : null}
              </span>
            </label>
          </div>

          {submitError ? (
            <p className="text-sm text-red-400 mt-3">{submitError}</p>
          ) : null}

          <div className="mt-4 flex gap-2">
            <Button
              size="lg"
              className="w-full"
              disabled={submitting}
              onClick={acceptAndContinue}
            >
              {submitting ? "保存中..." : "同意して続ける"}
            </Button>
          </div>

          <p className="text-[11px] text-gray-500 mt-3">
            同意せずに利用を継続することはできません。
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        className="max-w-2xl"
      >
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">利用規約</h2>
              <p className="text-xs text-gray-500">
                最終更新日: {termsUpdatedAt || "—"}
              </p>
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
              <h2 className="text-lg font-bold text-white">
                プライバシーポリシー
              </h2>
              <p className="text-xs text-gray-500">
                最終更新日: {privacyUpdatedAt || "—"}
              </p>
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
    </>
  );
}
