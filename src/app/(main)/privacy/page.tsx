export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">プライバシーポリシー</h1>

      <div className="prose prose-pink max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. 収集する情報</h2>
          <p>当サービス「rasher」では、以下の情報を収集します：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>メールアドレス（アカウント登録時）</li>
            <li>ユーザー名（プロフィール設定時）</li>
            <li>プロフィール画像（任意）</li>
            <li>投稿した豆知識、コメント、リアクションの情報</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. 情報の利用目的</h2>
          <p>収集した情報は以下の目的で利用します：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>サービスの提供・運営</li>
            <li>ユーザーへの通知・お知らせ</li>
            <li>サービスの改善・新機能開発</li>
            <li>不正利用の防止</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. 情報の共有</h2>
          <p>
            ユーザーの個人情報を第三者に販売・共有することはありません。
            ただし、法令に基づく開示請求があった場合はこの限りではありません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Cookieの使用</h2>
          <p>
            当サービスでは、ログイン状態の維持やユーザー体験の向上のためにCookieを使用しています。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. データの保護</h2>
          <p>
            ユーザーの情報は、適切なセキュリティ対策を講じて保護しています。
            パスワードは暗号化して保存され、通信はSSL/TLSで暗号化されています。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. ユーザーの権利</h2>
          <p>ユーザーは以下の権利を有します：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>自身の情報へのアクセス</li>
            <li>情報の訂正・削除の要求</li>
            <li>メール通知の停止</li>
            <li>アカウントの削除</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. ポリシーの変更</h2>
          <p>
            本ポリシーは予告なく変更される場合があります。
            重要な変更がある場合は、サービス内でお知らせします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">8. お問い合わせ</h2>
          <p>
            プライバシーに関するお問い合わせは、サービス運営者までご連絡ください。
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          最終更新日: 2024年12月24日
        </p>
      </div>
    </div>
  );
}
