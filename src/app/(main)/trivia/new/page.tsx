"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types/database";

export default function NewTriviaPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();

      // ユーザー確認
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      // カテゴリ取得
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (data) {
        setCategories(data);
      }
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (title.length < 5) {
      setError("タイトルは5文字以上で入力してください");
      return;
    }
    if (content.length < 10) {
      setError("本文は10文字以上で入力してください");
      return;
    }
    if (!categoryId) {
      setError("カテゴリを選択してください");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("trivia")
      .insert({
        user_id: userId!,
        title,
        content,
        category_id: categoryId,
      } as any)
      .select()
      .single();

    if (insertError) {
      setError("投稿に失敗しました。もう一度お試しください");
      setIsLoading(false);
      return;
    }

    router.push(`/trivia/${(data as any).id}`);
  };

  if (!userId) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 戻るリンク */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-pink-500 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>戻る</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">🐘</span>
          豆知識を投稿する
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* カテゴリ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${
                      categoryId === category.id
                        ? "ring-2 ring-offset-2 ring-pink-400"
                        : "hover:opacity-80"
                    }
                  `}
                  style={{
                    backgroundColor:
                      categoryId === category.id
                        ? category.color
                        : `${category.color}20`,
                    color:
                      categoryId === category.id ? "white" : category.color,
                  }}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル
              <span className="text-gray-400 font-normal ml-2">
                ({title.length}/100)
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              placeholder="例：バナナは実は草の実である"
            />
          </div>

          {/* 本文 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              本文
              <span className="text-gray-400 font-normal ml-2">
                ({content.length}/1000)
              </span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 1000))}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
              placeholder="豆知識の詳細を書いてください..."
            />
          </div>

          {/* 投稿ボタン */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-pink-400 to-pink-600 text-white font-bold text-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                投稿中...
              </>
            ) : (
              <>
                <span className="text-xl">🐘</span>
                投稿する
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
