import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl text-gray-800 bg-white">
      <h1 className="text-3xl font-bold mb-8">利用規約・プライバシーポリシー</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">利用規約</h2>
        
        <h3 className="text-xl font-semibold mb-2">1. 免責事項</h3>
        <p className="mb-4 text-sm leading-relaxed">
          本アプリ「Planning Poker Online」（以下、当アプリ）を利用したことによって生じた、いかなる損害（データの消失、業務の遅滞などを含む）についても、運営者は一切の責任を負いません。
          ユーザー自身の責任においてご利用ください。
        </p>

        <h3 className="text-xl font-semibold mb-2">2. サービスの変更・停止</h3>
        <p className="mb-4 text-sm leading-relaxed">
          当アプリは、予告なく機能の変更、停止、またはサービスを終了することがあります。
          また、一定期間利用のない部屋のデータや、システムの維持に必要な範囲で、データを削除する場合があります。
        </p>

        <h3 className="text-xl font-semibold mb-2">3. 禁止事項</h3>
        <p className="mb-4 text-sm leading-relaxed">
          当アプリのサーバーへの攻撃、不正な手段によるデータ操作、その他運営者が不適切と判断する行為を禁止します。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">プライバシーポリシー</h2>

        <h3 className="text-xl font-semibold mb-2">1. 収集する情報</h3>
        <p className="mb-4 text-sm leading-relaxed">
          当アプリでは、サービスの提供にあたり、以下の情報を一時的に利用します。<br />
          ・ニックネーム（ユーザーが任意に入力したもの）<br />
          ・投票データ<br />
          ・アクセス解析データ（IPアドレス、ブラウザ情報など）<br />
          ※ メールアドレスや氏名などの個人を特定できる情報は収集しておりません。
        </p>

        <h3 className="text-xl font-semibold mb-2">2. 利用している外部サービス</h3>
        <p className="mb-4 text-sm leading-relaxed">
          当アプリでは、サービスの品質向上やアクセス解析のために、以下の外部サービスを利用しています。
          これらのサービスは、Cookie（クッキー）や匿名IDを使用してデータを収集する場合があります。
        </p>
        <ul className="list-disc list-inside mb-4 text-sm ml-4">
          <li>
            <strong>Firebase (Google Inc.)</strong><br />
            認証、データベース、ホスティングに利用しています。<br />
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Googleプライバシーポリシー</a>
          </li>
          <li>
            <strong>Sentry</strong><br />
            エラーの検知・解析のために利用しています。
          </li>
          {/* Google Analyticsを入れている場合は以下も追加 */}
          <li>
            <strong>Google Analytics</strong><br />
            アクセス解析のために利用しています。
          </li>
        </ul>
      </section>

      <div className="mt-12 pt-8 border-t text-center">
        <Link href="/" className="text-blue-600 hover:underline">
          トップページに戻る
        </Link>
      </div>
    </main>
  );
}