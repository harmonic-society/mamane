"use client";

import { Twitter, Facebook, Link2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  triviaId: string;
  triviaTitle: string;
}

export function ShareButtons({ triviaId, triviaTitle }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mamane.vercel.app";
  const shareUrl = `${siteUrl}/trivia/${triviaId}`;
  const shareText = `${triviaTitle} - mamane`;

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 mr-1">シェア:</span>

      {/* X (Twitter) */}
      <button
        onClick={handleTwitterShare}
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        title="Xでシェア"
      >
        <Twitter className="w-4 h-4 text-gray-700" />
      </button>

      {/* Facebook */}
      <button
        onClick={handleFacebookShare}
        className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors"
        title="Facebookでシェア"
      >
        <Facebook className="w-4 h-4 text-blue-600" />
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`p-2 rounded-full transition-colors ${
          copied
            ? "bg-green-100 text-green-600"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
        title={copied ? "コピーしました！" : "リンクをコピー"}
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
