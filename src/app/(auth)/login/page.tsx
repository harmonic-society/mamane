"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "banned") {
      setError("このアカウントは利用停止されています。");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("メールアドレスまたはパスワードが間違っています");
      setIsLoading(false);
      return;
    }

    // profilesを確認（BANチェック含む）
    if (data.user) {
      const profileResult = await supabase
        .from("profiles")
        .select("id, is_banned")
        .eq("id", data.user.id)
        .single();

      const profile = profileResult.data as { id: string; is_banned: boolean | null } | null;

      // BANされている場合はログアウトしてエラー表示
      if (profile?.is_banned === true) {
        await supabase.auth.signOut();
        setError("このアカウントは利用停止されています。");
        setIsLoading(false);
        return;
      }

      if (!profile) {
        const username = data.user.user_metadata?.username || `user_${data.user.id.slice(0, 8)}`;
        await supabase.from("profiles").insert({
          id: data.user.id,
          username,
        } as any);
      }
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* ぞうさんマスコット */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-md">
          <span className="text-3xl">🐬</span>
        </div>
      </div>
      <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              placeholder="••••••••"
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
              ログイン中...
            </>
          ) : (
            "ログイン"
          )}
        </button>
      </form>

      <div className="text-center mt-4">
        <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-pink-600">
          パスワードをお忘れですか？
        </Link>
      </div>

      <p className="text-center text-gray-500 text-sm mt-4">
        アカウントをお持ちでない方は
        <Link href="/signup" className="text-pink-600 hover:underline ml-1">
          新規登録
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <Suspense fallback={
        <div className="bg-white rounded-2xl shadow-xl p-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
