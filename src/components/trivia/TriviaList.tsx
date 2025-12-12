"use client";

import { TriviaCard } from "./TriviaCard";
import type { TriviaWithDetails } from "@/types/database";

interface TriviaListProps {
  triviaList: TriviaWithDetails[];
  userReactions: string[];
  userId?: string;
  showRank?: boolean;
}

export function TriviaList({
  triviaList,
  userReactions,
  userId,
  showRank = false,
}: TriviaListProps) {
  if (triviaList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">まだ豆知識がありません</p>
      </div>
    );
  }

  return (
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
  );
}
