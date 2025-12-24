import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "rasher - 豆知識共有サイト",
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
