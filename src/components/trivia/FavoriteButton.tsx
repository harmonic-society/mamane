"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { motion } from "framer-motion";

interface FavoriteButtonProps {
  triviaId: string;
  initialFavorited?: boolean;
  userId?: string;
}

export function FavoriteButton({ triviaId, initialFavorited = false, userId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      window.location.href = "/login";
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/favorite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ triviaId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.favorited);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading}
      whileTap={{ scale: 0.9 }}
      className={`
        p-2 rounded-full transition-colors
        ${isFavorited
          ? "text-yellow-500 bg-yellow-50"
          : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
        }
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
      title={isFavorited ? "お気に入りを解除" : "お気に入りに追加"}
    >
      <Bookmark
        className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
      />
    </motion.button>
  );
}
