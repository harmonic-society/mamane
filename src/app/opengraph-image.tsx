import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Rasher - 豆知識共有サイト";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #FDF2F8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        {/* ロゴエリア */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 120,
              marginRight: 20,
            }}
          >
            🐘
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: "bold",
              color: "white",
              textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Rasher
          </div>
        </div>

        {/* キャッチコピー */}
        <div
          style={{
            fontSize: 36,
            color: "white",
            textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
            marginBottom: 20,
          }}
        >
          豆知識共有サイト
        </div>

        {/* サブキャッチ */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          「へぇ〜」と言いたくなる雑学がいっぱい！
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
