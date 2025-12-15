"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";

interface CommentFormProps {
  triviaId: string;
  userId?: string;
}

export function CommentForm({ triviaId, userId }: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      router.push("/login");
      return;
    }

    if (!content.trim()) {
      setError("コメントを入力してください");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const supabase = createClient();

    const { error: insertError } = await supabase.from("comments").insert({
      trivia_id: triviaId,
      user_id: userId,
      content: content.trim(),
    } as any);

    if (insertError) {
      console.error("コメント投稿エラー:", insertError);
      setError("コメントの投稿に失敗しました");
      setIsSubmitting(false);
      return;
    }

    setContent("");
    setIsSubmitting(false);
    router.refresh();
  };

  if (!userId) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600 mb-2">コメントするにはログインが必要です</p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow"
        >
          ログイン
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="コメントを入力..."
          rows={2}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none resize-none"
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed self-end"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}
