"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Search, PenLine, Trophy, LogIn, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  user?: { id: string; username: string; avatar_url?: string | null } | null;
}

export function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-pink-50/80 backdrop-blur-md border-b border-pink-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-md"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-2xl">🐬</span>
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
              mamane
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/ranking"
              className="flex items-center gap-1 text-gray-600 hover:text-pink-500 transition-colors"
            >
              <Trophy size={18} />
              <span>ランキング</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-1 text-gray-600 hover:text-pink-500 transition-colors"
            >
              <HelpCircle size={18} />
              <span>ラッシャーとは？</span>
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-1 text-gray-600 hover:text-pink-500 transition-colors"
            >
              <Search size={18} />
              <span>検索</span>
            </Link>
            {user ? (
              <>
                <Link
                  href="/trivia/new"
                  className="flex items-center gap-1 bg-gradient-to-r from-pink-400 to-pink-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-shadow"
                >
                  <PenLine size={18} />
                  <span>投稿する</span>
                </Link>
                <Link
                  href={`/user/${user.id}`}
                  className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity"
                  title="マイページ"
                >
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.username}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-gray-600 hover:text-pink-500 transition-colors"
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
            className="md:hidden bg-pink-50 border-b border-pink-100"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/ranking"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-pink-100"
              >
                <Trophy size={20} className="text-pink-500" />
                <span>ランキング</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-pink-100"
              >
                <HelpCircle size={20} className="text-pink-500" />
                <span>ラッシャーとは？</span>
              </Link>
              <Link
                href="/search"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-pink-100"
              >
                <Search size={20} className="text-pink-500" />
                <span>検索</span>
              </Link>
              {user ? (
                <>
                  <Link
                    href="/trivia/new"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-pink-400 to-pink-600 text-white"
                  >
                    <PenLine size={20} />
                    <span>投稿する</span>
                  </Link>
                  <Link
                    href={`/user/${user.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-pink-100"
                  >
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-sm text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>マイページ</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-pink-100"
                >
                  <LogIn size={20} className="text-pink-500" />
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
