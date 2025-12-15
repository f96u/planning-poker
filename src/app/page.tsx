'use client';
import { useState } from 'react';
import { ref, push, serverTimestamp, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const createRoom = async () => {
    // 認証前の場合は部屋作成権限がないため処理停止
    if (!user) return;

    setIsCreating(true);
    try {
      const newRoomRef = push(ref(db, 'rooms'))
      await set(newRoomRef, {
        createdAt: serverTimestamp(),
        status: 'voting', // voting, revealed
        users: {}
      });

      const roomId = newRoomRef.key;
      router.push(`/rooms/${roomId}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* メインコンテンツ */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
          {/* アイコン・タイトル */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
              <span className="text-5xl">🃏</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-3">
              Planning Poker
            </h1>
            <p className="text-gray-500 text-lg">
              チームで見積もりを効率的に行いましょう
            </p>
          </div>

          {/* 説明 */}
          <div className="mb-10 text-left bg-gray-50 rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-gray-700 text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              使い方
            </h2>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <p>「新しいルームを作成」ボタンをクリック</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <p>生成されたルームIDをチームメンバーに共有</p>
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
          <button
            onClick={createRoom}
            disabled={isCreating || loading}
            className={`
              w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 
              text-white font-bold text-lg rounded-full shadow-lg 
              transition-all duration-200 transform hover:scale-105 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              flex items-center justify-center gap-3 mx-auto
              min-h-[56px]
            `}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white text-2xl"></div>
                <span>読み込み中...</span>
              </>
            ) : isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white text-2xl"></div>
                <span>作成中...</span>
              </>
            ) : (
              <>
                <span className="h-5 w-5 mb-2">🚀</span>
                <span>新しいルームを作成</span>
              </>
            )}
          </button>

          {/* フッター情報 */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-400">
              Planning Poker は、チームの見積もりを効率化するためのツールです
            </p>
          </div>
        </div>

        {/* 特徴 */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
            <div className="text-3xl mb-2">⚡</div>
            <p className="text-sm font-semibold text-gray-700">リアルタイム同期</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm font-semibold text-gray-700">複数人対応</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm font-semibold text-gray-700">平均値表示</p>
          </div>
        </div>
      </div>
    </div>
  );
}
