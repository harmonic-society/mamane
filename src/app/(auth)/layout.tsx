import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-md">
          <span className="text-2xl">🐬</span>
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
          Rasher
        </span>
      </Link>
      {children}
    </div>
  );
}
