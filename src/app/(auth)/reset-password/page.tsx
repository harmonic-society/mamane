"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Lock, Loader2, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsValidSession(true);
      }
      setIsChecking(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError("パスワードの更新に失敗しました。もう一度お試しください。");
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);

    // 3秒後にログインページへ
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  };

  if (isChecking) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto" />
          <p className="text-gray-500 mt-4">確認中...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-3xl">!</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">リンクが無効です</h1>
          <p className="text-gray-600 mb-6">
            パスワードリセットリンクが無効か、有効期限が切れています。
            <br />
            もう一度リセットをお試しください。
          </p>
          <Link
            href="/forgot-password"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-pink-400 to-pink-600 text-white font-medium hover:shadow-lg transition-shadow"
          >
            パスワードリセットを再送信
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">パスワードを変更しました</h1>
          <p className="text-gray-600 mb-2">
            新しいパスワードでログインできます。
          </p>
          <p className="text-sm text-gray-400">
            まもなくログインページへ移動します...
          </p>
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
        <h1 className="text-2xl font-bold text-center mb-2">新しいパスワードを設定</h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          新しいパスワードを入力してください。
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              新しいパスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                placeholder="6文字以上"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード（確認）
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                placeholder="もう一度入力"
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
                更新中...
              </>
            ) : (
              "パスワードを変更"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
