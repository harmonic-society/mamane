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
}

export function HeeButton({
  triviaId,
  initialCount,
  hasReacted,
  userId,
}: HeeButtonProps) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [isReacted, setIsReacted] = useState(hasReacted);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);

  const handleClick = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    if (isReacted || isAnimating) return;

    setIsAnimating(true);
    setCount((prev) => prev + 1);
    setIsReacted(true);

    // パーティクルエフェクト
    setParticles([...Array(10)].map((_, i) => i));

    const supabase = createClient();

    const { error } = await supabase.from("hee_reactions").insert({
      trivia_id: triviaId,
      user_id: userId,
    } as any);

    if (error) {
      setCount((prev) => prev - 1);
      setIsReacted(false);
    }

    setTimeout(() => {
      setIsAnimating(false);
      setParticles([]);
    }, 800);
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      <motion.button
        onClick={handleClick}
        disabled={isReacted}
        whileTap={{ scale: 0.9 }}
        className={`
          relative px-6 py-3 rounded-full font-bold text-lg
          transition-all duration-300 overflow-hidden
          ${
            isReacted
              ? "bg-yellow-100 text-yellow-700 cursor-default border-2 border-yellow-400"
              : "bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:shadow-lg hover:scale-105 cursor-pointer"
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
              className="absolute inset-0 bg-yellow-300 rounded-full"
            />
          )}
        </AnimatePresence>

        <span className="relative z-10 flex items-center gap-1">
          <motion.span
            className="text-2xl"
            animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {isReacted ? "👏" : "👆"}
          </motion.span>
          <span>へぇ</span>
          {isReacted && <span>!</span>}
        </span>
      </motion.button>

      {/* パーティクル */}
      <AnimatePresence>
        {particles.map((i) => (
          <motion.span
            key={i}
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
            className="absolute text-xl pointer-events-none font-bold text-yellow-500"
            style={{ top: "20%" }}
          >
            へぇ
          </motion.span>
        ))}
      </AnimatePresence>

      {/* カウント表示 */}
      <motion.div
        key={count}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="mt-2 text-gray-600 font-bold"
      >
        <span className="text-xl text-yellow-600">{count.toLocaleString()}</span>
        <span className="text-sm ml-1">へぇ</span>
      </motion.div>
    </div>
  );
}
