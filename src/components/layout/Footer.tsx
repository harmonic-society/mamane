import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-pink-50 border-t border-pink-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-lg">🐘</span>
            </div>
            <span className="font-bold text-pink-600">mamane</span>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/ranking" className="hover:text-pink-500 transition-colors">
              ランキング
            </Link>
            <Link href="/search" className="hover:text-pink-500 transition-colors">
              検索
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-pink-400">
            &copy; {new Date().getFullYear()} mamane
          </p>
        </div>
      </div>
    </footer>
  );
}
