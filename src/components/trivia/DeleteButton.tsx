"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteButtonProps {
  triviaId: string;
  userId: string;
  authorId: string;
}

export function DeleteButton({ triviaId, userId, authorId }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 投稿者以外には表示しない
  if (userId !== authorId) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("trivia")
      .delete()
      .eq("id", triviaId)
      .eq("user_id", userId);

    if (error) {
      console.error("削除エラー:", error);
      alert("削除に失敗しました");
      setIsDeleting(false);
      return;
    }

    // トップページへリダイレクト
    router.push("/");
    router.refresh();
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">本当に削除しますか？</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "削除"
          )}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          キャンセル
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors text-sm"
    >
      <Trash2 className="w-4 h-4" />
      <span>削除</span>
    </button>
  );
}
