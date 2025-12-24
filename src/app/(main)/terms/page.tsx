export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">利用規約</h1>

      <div className="prose prose-pink max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. はじめに</h2>
          <p>
            本利用規約（以下「本規約」）は、rasher（以下「当サービス」）の利用条件を定めるものです。
            ユーザーの皆様には、本規約に同意いただいた上で、当サービスをご利用いただきます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. サービスの内容</h2>
          <p>
            当サービスは、ユーザーが豆知識を投稿・共有できるプラットフォームです。
            ユーザーは豆知識の投稿、閲覧、リアクション、コメントなどの機能を利用できます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. アカウント</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>ユーザーは正確な情報を提供してアカウントを登録する必要があります</li>
            <li>アカウント情報の管理はユーザー自身の責任となります</li>
            <li>アカウントの譲渡・貸与は禁止されています</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. 禁止事項</h2>
          <p>以下の行為を禁止します：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>法令に違反する行為</li>
            <li>他のユーザーへの誹謗中傷、嫌がらせ</li>
            <li>虚偽の情報の投稿</li>
            <li>著作権・知的財産権を侵害する行為</li>
            <li>わいせつな内容の投稿</li>
            <li>スパム行為、商業目的の宣伝</li>
            <li>サービスの運営を妨害する行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. コンテンツの権利</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>ユーザーが投稿したコンテンツの著作権はユーザーに帰属します</li>
            <li>投稿することで、当サービスにコンテンツの利用許諾を与えたものとみなします</li>
            <li>他者の権利を侵害するコンテンツは削除される場合があります</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. アカウントの停止・削除</h2>
          <p>
            本規約に違反した場合、運営者の判断によりアカウントの停止または削除を行う場合があります。
            また、ユーザー自身でアカウントを削除することもできます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. 免責事項</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>当サービスは現状有姿で提供され、特定の目的への適合性を保証しません</li>
            <li>ユーザー間のトラブルについて、運営者は責任を負いません</li>
            <li>サービスの中断・終了による損害について、運営者は責任を負いません</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">8. 規約の変更</h2>
          <p>
            本規約は予告なく変更される場合があります。
            変更後も当サービスを利用することで、変更後の規約に同意したものとみなします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">9. 準拠法・管轄</h2>
          <p>
            本規約は日本法に準拠し、本規約に関する紛争は日本の裁判所を専属的合意管轄とします。
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          最終更新日: 2024年12月24日
        </p>
      </div>
    </div>
  );
}
