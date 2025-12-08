import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span className="font-bold text-gray-700">mamane</span>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/ranking" className="hover:text-gray-700 transition-colors">
              ランキング
            </Link>
            <Link href="/search" className="hover:text-gray-700 transition-colors">
              検索
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} mamane
          </p>
        </div>
      </div>
    </footer>
  );
}
