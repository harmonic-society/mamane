import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <span className="text-4xl">💡</span>
        <span className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
          mamane
        </span>
      </Link>
      {children}
    </div>
  );
}
