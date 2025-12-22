"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TriviaCard } from "./TriviaCard";
import { Loader2 } from "lucide-react";
import type { TriviaWithDetails } from "@/types/database";

interface TriviaListProps {
  initialTriviaList: TriviaWithDetails[];
  userReactions: string[];
  userId?: string;
  showRank?: boolean;
}

export function TriviaList({
  initialTriviaList,
  userReactions,
  userId,
  showRank = false,
}: TriviaListProps) {
  const [triviaList, setTriviaList] = useState<TriviaWithDetails[]>(initialTriviaList);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialTriviaList.length === 20);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/trivia?page=${page}`);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setTriviaList((prev) => [...prev, ...data.data]);
        setPage((prev) => prev + 1);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more trivia:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading]);

  if (triviaList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">まだ豆知識がありません</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        {triviaList.map((trivia, index) => (
          <TriviaCard
            key={trivia.id}
            trivia={trivia}
            hasReacted={userReactions.includes(trivia.id)}
            userId={userId}
            rank={showRank ? index + 1 : undefined}
          />
        ))}
      </div>

      {/* ローダー */}
      <div ref={loaderRef} className="flex justify-center py-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>読み込み中...</span>
          </div>
        )}
        {!hasMore && triviaList.length > 0 && (
          <p className="text-gray-400 text-sm">すべての豆知識を表示しました</p>
        )}
      </div>
    </div>
  );
}
