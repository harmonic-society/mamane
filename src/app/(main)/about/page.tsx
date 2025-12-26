import { HelpCircle } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <HelpCircle className="text-pink-500" size={32} />
        ラッシャーとは？
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
        {/* ラッシャーくんマスコット */}
        <div className="text-center">
          <div className="inline-block">
            <Image
              src="/Gemini_Generated_Image_5305925305925305.png"
              alt="ラッシャーくん"
              width={150}
              height={150}
              className="mx-auto rounded-2xl shadow-lg"
            />
          </div>
        </div>

        {/* 説明セクション */}
        <section>
          <h2 className="text-xl font-bold text-pink-600 mb-4">Rasherへようこそ！</h2>
          <p className="text-gray-600 leading-relaxed">
            Rasherは、みんなで面白い豆知識を共有するサイトです。
            「へぇ〜」と言いたくなるような豆知識を投稿して、みんなと楽しみましょう！
          </p>
        </section>

        {/* ラッシャーの説明 */}
        <section>
          <h2 className="text-xl font-bold text-pink-600 mb-4">「ラッシャー！」って何？</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            「ラッシャー！」は、Rasherオリジナルの応援・共感ボタンだよ♩いいね＝ラッシャー！ってこと。
            面白い豆知識を見つけたら、「ラッシャー！」ボタンを押して投稿者を応援してね！
            みんなでいっぱいラッシャー！しようね❤️
          </p>
          <div className="bg-pink-50 rounded-xl p-6 text-center">
            <p className="text-pink-600 font-bold text-lg mb-2">
              たくさんの「ラッシャー！」をもらおう！
            </p>
            <p className="text-gray-500 text-sm">
              ランキングで上位を目指してみてね 🐬
            </p>
            <p className="text-gray-500 text-sm mt-2">
              ランキング上位の人とラッシャーくんが気に入った豆知識投稿をしてくれた人には<span className="text-red-500 font-bold text-base">オリジナルアイコン</span>を<span className="text-red-500 font-bold text-base">プレゼント</span>🎁
            </p>
            <p className="text-gray-500 text-sm mt-1">
              更に<span className="text-red-500 font-bold text-base">特典</span>がいっぱいだよ🐬
            </p>
          </div>
        </section>

        {/* 使い方 */}
        <section>
          <h2 className="text-xl font-bold text-pink-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">🐬</span>
            使い方
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">アカウント登録</h3>
                <p className="text-gray-600 text-sm">まずは新規登録してアカウントを作成しましょう</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">豆知識を投稿</h3>
                <p className="text-gray-600 text-sm">あなたが知っている面白い豆知識を投稿してみましょう</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">ラッシャー！で応援</h3>
                <p className="text-gray-600 text-sm">気に入った豆知識には「ラッシャー！」ボタンで応援しよう</p>
              </div>
            </div>
          </div>
        </section>

        {/* フッター */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-gray-400 text-sm">
            さあ、ピンクのイルカと一緒に豆知識を楽しもう！ 🐬
          </p>
        </div>
      </div>
    </div>
  );
}
