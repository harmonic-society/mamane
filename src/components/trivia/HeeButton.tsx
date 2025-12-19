"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface HeeButtonProps {
  triviaId: string;
  initialCount: number;
  hasReacted: boolean;
  userId?: string;
  authorId?: string;
}

export function HeeButton({
  triviaId,
  initialCount,
  hasReacted,
  userId,
  authorId,
}: HeeButtonProps) {
  // 自分の投稿かどうか
  const isOwnPost = userId && authorId && userId === authorId;
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [isReacted, setIsReacted] = useState(hasReacted);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);
  const [stars, setStars] = useState<number[]>([]);

  const handleClick = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    // 自分の投稿には押せない
    if (isOwnPost) return;

    if (isReacted || isAnimating) return;

    setIsAnimating(true);
    setCount((prev) => prev + 1);
    setIsReacted(true);

    // パーティクルエフェクト
    setParticles([...Array(10)].map((_, i) => i));
    // キラキラ星エフェクト
    setStars([...Array(15)].map((_, i) => i));

    const supabase = createClient();

    const { error } = await supabase.from("hee_reactions").insert({
      trivia_id: triviaId,
      user_id: userId,
    } as any);

    if (error) {
      console.error("ラッシャー登録エラー:", error);
      setCount((prev) => prev - 1);
      setIsReacted(false);
    }

    setTimeout(() => {
      setIsAnimating(false);
      setParticles([]);
      setStars([]);
    }, 800);
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      <motion.button
        onClick={handleClick}
        disabled={isReacted || !!isOwnPost}
        whileTap={{ scale: 0.9 }}
        className={`
          relative px-6 py-3 rounded-full font-bold text-lg
          transition-all duration-300 overflow-hidden
          ${
            isOwnPost
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200"
              : isReacted
              ? "bg-pink-100 text-pink-700 cursor-default border-2 border-pink-400"
              : "bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:shadow-lg hover:scale-105 cursor-pointer"
          }
        `}
      >
        {/* 背景アニメーション */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-pink-300 rounded-full"
            />
          )}
        </AnimatePresence>

        <span className="relative z-10 flex items-center gap-2">
          <motion.span
            className="text-2xl"
            animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            🐬
          </motion.span>
          <span>ラッシャー！</span>
        </span>
      </motion.button>

      {/* カウント表示 */}
      <motion.p
        key={count}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="mt-2 text-sm text-gray-500"
      >
        <span className="font-bold text-pink-500">{count.toLocaleString()}</span> ラッシャー
      </motion.p>

      {/* パーティクル（イルカ） */}
      <AnimatePresence>
        {particles.map((i) => (
          <motion.span
            key={`dolphin-${i}`}
            initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            animate={{
              opacity: 0,
              y: -80 - Math.random() * 40,
              x: (Math.random() - 0.5) * 120,
              scale: 0.5,
              rotate: Math.random() * 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute text-xl pointer-events-none font-bold text-pink-500"
            style={{ top: "20%" }}
          >
            🐬
          </motion.span>
        ))}
      </AnimatePresence>

      {/* キラキラ星エフェクト */}
      <AnimatePresence>
        {stars.map((i) => {
          const starEmojis = ["✨", "⭐", "🌟", "💫"];
          const emoji = starEmojis[i % starEmojis.length];
          const angle = (i / 15) * 360;
          const distance = 60 + Math.random() * 40;
          const endX = Math.cos((angle * Math.PI) / 180) * distance;
          const endY = Math.sin((angle * Math.PI) / 180) * distance - 40;

          return (
            <motion.span
              key={`star-${i}`}
              initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
              animate={{
                opacity: [1, 1, 0],
                y: endY,
                x: endX,
                scale: [0.5, 1.2, 0.8],
                rotate: Math.random() * 360,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.7 + Math.random() * 0.3,
                ease: "easeOut",
                delay: Math.random() * 0.1,
              }}
              className="absolute text-lg pointer-events-none"
              style={{ top: "30%" }}
            >
              {emoji}
            </motion.span>
          );
        })}
      </AnimatePresence>

    </div>
  );
}
