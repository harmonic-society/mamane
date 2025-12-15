"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, LogOut } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-3xl">🐬</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">ログアウト</h1>

        <p className="text-center text-gray-600 mb-6">
          ログアウトしますか？
        </p>

        <div className="space-y-3">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-400 to-pink-600 text-white font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                ログアウト中...
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                ログアウトする
              </>
            )}
          </button>

          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
