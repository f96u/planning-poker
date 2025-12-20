import Link from 'next/link';
import { CreateRoomButton } from './_components/CreateRoomButton';
import { Sparkles, Zap, Users, BarChart3, Coffee } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* メインコンテンツ */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
          {/* アイコン・タイトル */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-3">
              Scrum Poker
            </h1>
            <p className="text-gray-500 text-lg">
              チームで見積もりを効率的に行いましょう
            </p>
          </div>

          {/* 説明 */}
          <div className="mb-10 text-left bg-gray-50 rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-gray-700 text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              使い方
            </h2>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <p>「新しいルームを作成」ボタンをクリック</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <p>ルーム画面右上の「URLを共有」ボタンをクリックし、表示されたURLを参加してほしいメンバーに共有</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <p>全員が投票したら「結果を見る」で開示</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <p>次のゲームへ進む場合は「次のゲームへ」をクリック</p>
              </div>
            </div>
          </div>

          {/* 作成ボタン */}
          <CreateRoomButton />

          {/* フッター情報 */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-400">
              Scrum Poker は、チームの見積もりを効率化するためのツールです
            </p>
          </div>
        </div>

        {/* 特徴 */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
            <Zap className="mx-auto mb-2 h-7 w-7 text-indigo-500" />
            <p className="text-sm font-semibold text-gray-700">リアルタイム同期</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
            <Users className="mx-auto mb-2 h-7 w-7 text-indigo-500" />
            <p className="text-sm font-semibold text-gray-700">複数人対応</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
            <BarChart3 className="mx-auto mb-2 h-7 w-7 text-indigo-500" />
            <p className="text-sm font-semibold text-gray-700">平均値表示</p>
          </div>
        </div>
         <footer className="mt-16 py-8 text-center text-gray-500 text-sm">
           <p>© 2025 Scrum Poker Online</p>
          <div className="mt-2 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/terms" className="hover:underline">
              利用規約・プライバシーポリシー
            </Link>
            <a
              href="https://buymeacoffee.com/f96u"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gray-500 hover:underline"
              title="Buy Me a Coffee"
            >
              <Coffee className="h-3 w-3" />
              <span className="">開発者にコーヒーを奢る</span>
            </a>
          </div>
      </footer>
      </div>
    </div>
  );
}
