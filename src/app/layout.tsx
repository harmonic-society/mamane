import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mamane - 豆知識投稿サイト",
  description: "面白い豆知識を投稿・共有しよう！「へぇ〜」と言いたくなる雑学がいっぱい",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
