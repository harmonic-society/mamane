"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

// カテゴリの定義
const CATEGORIES = [
  { id: "lifestyle", name: "生活", icon: "🏠", color: "#2196F3" },
  { id: "fashion", name: "ファッション", icon: "👗", color: "#E91E63" },
  { id: "music", name: "音楽", icon: "🎵", color: "#9C27B0" },
  { id: "anime", name: "漫画アニメ", icon: "📺", color: "#FF5722" },
  { id: "game", name: "ゲーム", icon: "🎮", color: "#4CAF50" },
  { id: "hobby", name: "趣味", icon: "⭐", color: "#FF9800" },
  { id: "overseas", name: "海外", icon: "🌍", color: "#00BCD4" },
  { id: "other", name: "その他", icon: "💡", color: "#607D8B" },
];

export default function NewTriviaPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // キラキラ音を再生する関数
  const playSparkleSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const notes = [1200, 1500, 1800, 2100, 2400];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const start = ctx.currentTime + index * 0.08;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {
      // Audio API not supported - fail silently
    }
  };

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
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedCategory) {
      setError("カテゴリを選択してください");
      return;
    }
    if (title.length < 5) {
      setError("タイトルは5文字以上で入力してください");
      return;
    }
    if (content.length < 10) {
      setError("本文は10文字以上で入力してください");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();

    // カテゴリIDを取得
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", selectedCategory)
      .single() as { data: { id: string } | null };

    const { data, error: insertError } = await supabase
      .from("trivia")
      .insert({
        user_id: userId!,
        title,
        content,
        category_id: categoryData?.id || null,
      } as any)
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      setError(`投稿に失敗しました: ${insertError.message}`);
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);

    // キラキラ音を再生
    playSparkleSound();

    // 2秒後に詳細ページへ遷移
    setTimeout(() => {
      router.push(`/trivia/${(data as any).id}`);
    }, 2000);
  };

  if (!userId) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  // 投稿完了画面
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-4xl">🐬</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-pink-600">投稿完了！ラッシャー！</h1>
          <p className="text-gray-600 mb-2">豆知識が投稿されました</p>
          <p className="text-gray-400 text-sm">まもなく詳細ページへ移動します...</p>
        </div>
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
          <span className="text-2xl">🐬</span>
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
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    flex items-center justify-center gap-1
                    ${
                      selectedCategory === cat.id
                        ? "ring-2 ring-pink-400 bg-pink-50 text-pink-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                  `}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
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
              本文 <span className="text-red-500">*</span>
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
                <span className="text-xl">🐬</span>
                投稿する
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
