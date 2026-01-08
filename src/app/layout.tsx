import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Rasher - 豆知識共有サイト",
    template: "%s | Rasher",
  },
  description: "面白い豆知識を投稿・共有しよう！「へぇ〜」と言いたくなる雑学がいっぱい",
  keywords: ["豆知識", "雑学", "トリビア", "へぇ", "面白い", "知識共有"],
  authors: [{ name: "Rasher" }],
  metadataBase: new URL("https://mamane.vercel.app"),
  openGraph: {
    title: "Rasher - 豆知識共有サイト",
    description: "面白い豆知識を投稿・共有しよう！「へぇ〜」と言いたくなる雑学がいっぱい",
    url: "https://mamane.vercel.app",
    siteName: "Rasher",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rasher - 豆知識共有サイト",
    description: "面白い豆知識を投稿・共有しよう！「へぇ〜」と言いたくなる雑学がいっぱい",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2JNGJMGQR"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C2JNGJMGQR');
          `}
        </Script>
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
