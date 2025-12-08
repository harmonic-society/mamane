"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CategoryBadge } from "@/components/category/CategoryBadge";
import { HeeButton } from "./HeeButton";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import type { TriviaWithDetails } from "@/types/database";

interface TriviaCardProps {
  trivia: TriviaWithDetails;
  hasReacted: boolean;
  userId?: string;
  rank?: number;
}

export function TriviaCard({ trivia, hasReacted, userId, rank }: TriviaCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6"
    >
      {/* ランキング表示 */}
      {rank && (
        <div
          className={`
          absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center
          font-bold text-white text-lg shadow-md
          ${
            rank === 1
              ? "bg-yellow-400"
              : rank === 2
              ? "bg-gray-400"
              : rank === 3
              ? "bg-amber-600"
              : "bg-gray-300 text-gray-600"
          }
        `}
        >
          {rank}
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        {trivia.category_name && trivia.category_slug && trivia.category_icon && trivia.category_color && (
          <CategoryBadge
            name={trivia.category_name}
            icon={trivia.category_icon}
            color={trivia.category_color}
            slug={trivia.category_slug}
          />
        )}
        <time className="text-sm text-gray-400">
          {formatDistanceToNow(new Date(trivia.created_at), {
            addSuffix: true,
            locale: ja,
          })}
        </time>
      </div>

      {/* タイトル */}
      <Link href={`/trivia/${trivia.id}`}>
        <h2 className="text-xl font-bold text-gray-800 mb-3 hover:text-yellow-600 transition-colors line-clamp-2">
          {trivia.title}
        </h2>
      </Link>

      {/* 本文プレビュー */}
      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
        {trivia.content}
      </p>

      {/* フッター */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* 投稿者 */}
        <Link
          href={`/user/${trivia.author_id}`}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center text-sm font-medium text-yellow-700">
            {trivia.author_username.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
            {trivia.author_username}
          </span>
        </Link>

        {/* へぇボタン */}
        <HeeButton
          triviaId={trivia.id}
          initialCount={trivia.hee_count}
          hasReacted={hasReacted}
          userId={userId}
        />
      </div>
    </motion.article>
  );
}
