"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError("メール送信に失敗しました。メールアドレスを確認してください。");
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">メールを送信しました</h1>
          <p className="text-gray-600 mb-6">
            パスワードリセット用のリンクを
            <br />
            <span className="font-medium text-gray-800">{email}</span>
            <br />
            に送信しました。
          </p>
          <p className="text-sm text-gray-500 mb-6">
            メールが届かない場合は、迷惑メールフォルダを確認してください。
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700"
          >
            <ArrowLeft className="w-4 h-4" />
            ログインページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-3xl">🐬</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">パスワードをお忘れですか？</h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          登録したメールアドレスを入力してください。
          <br />
          パスワードリセット用のリンクをお送りします。
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                placeholder="example@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-400 to-pink-600 text-white font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                送信中...
              </>
            ) : (
              "リセットリンクを送信"
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          <Link href="/login" className="text-pink-600 hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            ログインページに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
