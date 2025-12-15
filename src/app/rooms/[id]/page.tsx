import { Board } from './_components/Board';
import { Hand } from './_components/Hand';
import { ShareButton } from './_components/ShareButton';
import Link from 'next/link';
import { Sparkles, Home } from 'lucide-react';
import { Metadata } from 'next';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const roomId = (await params).id;

  return {
    title: `Room: ${roomId}`, // ブラウザのタブやOGPのタイトルになる
    description: 'スクラムポーカーのルームに参加して見積もりを開始しましょう。',

    // layout.tsx の画像設定などを引き継ぎつつ、URLなどを上書き
    openGraph: {
      title: `Room: ${roomId} | Scrum Poker`,
      description: 'クリックして見積もりに参加',
      url: `/rooms/${roomId}`,
    },
  };
}

export default async function RoomPage({ params }: Props) {
  const roomId = (await params).id;

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Scrum Poker</h1>
                <p className="text-xs text-gray-500 font-mono">Room: {roomId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShareButton />
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white/80 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>トップへ</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <Board roomId={roomId} />
      </main>

      {/* 自分の手札（投票エリア） */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-[0_-5px_30px_rgba(0,0,0,0.15)] border-t border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <Hand roomId={roomId} />
          </div>
        </div>
      </div>
    </div>
  );
}


