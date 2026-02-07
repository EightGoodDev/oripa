"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
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

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

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
          登録することで、
          <Link href="/terms" className="underline">
            利用規約
          </Link>
          と
          <Link href="/privacy" className="underline">
            プライバシーポリシー
          </Link>
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
