"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, PenLine, Trophy, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  user?: { id: string; username: string } | null;
}

export function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.span
              className="text-3xl"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
            >
              💡
            </motion.span>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              mamane
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/ranking"
              className="flex items-center gap-1 text-gray-600 hover:text-yellow-600 transition-colors"
            >
              <Trophy size={18} />
              <span>ランキング</span>
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-1 text-gray-600 hover:text-yellow-600 transition-colors"
            >
              <Search size={18} />
              <span>検索</span>
            </Link>
            {user ? (
              <>
                <Link
                  href="/trivia/new"
                  className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full hover:shadow-lg transition-shadow"
                >
                  <PenLine size={18} />
                  <span>投稿する</span>
                </Link>
                <Link
                  href={`/user/${user.id}`}
                  className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
                >
                  {user.username.charAt(0).toUpperCase()}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <LogIn size={18} />
                <span>ログイン</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/ranking"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50"
              >
                <Trophy size={20} className="text-yellow-500" />
                <span>ランキング</span>
              </Link>
              <Link
                href="/search"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50"
              >
                <Search size={20} className="text-yellow-500" />
                <span>検索</span>
              </Link>
              {user ? (
                <>
                  <Link
                    href="/trivia/new"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                  >
                    <PenLine size={20} />
                    <span>投稿する</span>
                  </Link>
                  <Link
                    href={`/user/${user.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span>マイページ</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50"
                >
                  <LogIn size={20} className="text-yellow-500" />
                  <span>ログイン</span>
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
