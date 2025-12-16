import Link from 'next/link';
import { Sparkles, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
          {/* アイコン・タイトル */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-6xl sm:text-7xl font-extrabold text-indigo-600 mb-4">404</h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              ページが見つかりません
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              お探しのページは存在しないか、移動された可能性があります
            </p>
          </div>

          {/* ボタン */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <Home className="h-5 w-5" />
              <span>トップページへ戻る</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

