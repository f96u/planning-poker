'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ref, update, onDisconnect, onValue } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import { Room } from '@/types';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// フィボナッチ数列のカード
const CARDS = [1, 2, 3, 5, 8, 13, 21, '?']

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [myName, setMyName] = useState('ゲスト');

  // 認証
  useEffect(() => {
    signInAnonymously(auth).catch(error => {
      console.error('Failed to sign in anonymously:', error);
    })
    // ログイン状態を監視
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid);
        const userRef = ref(db, `rooms/${roomId}/users/${user.uid}`);
        setMyName(user.displayName || 'ゲスト');
        update(userRef, {
          online: true,
        });
        onDisconnect(userRef).update({
          online: false,
        });
      }
    });
    return () => unsubscribe();
  }, [roomId])

  // リアルタイム同期
  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, snapshot => {
      const data = snapshot.val() as Room | null;
      setRoomData(data);
    })

    return () => unsubscribe();
  }, [roomId]);

  const handleVote = (card: number | string) => {
    if (!userId) return;
    const userRef = ref(db, `rooms/${roomId}/users/${userId}`);
    update(userRef, {
      vote: card,
      online: true,
    });
  }

  const revealCards = () => {
    if (!roomId) return;
    update(ref(db, `rooms/${roomId}`), {
      status: 'revealed',
    });
  }

  const resetTable = () => {
    if (!roomId || !roomData?.users) return;

    // 一括更新用のオブジェクトを作成
    const updates: Record<string, unknown> = {
      [`rooms/${roomId}/status`]: 'voting',
      // 全ユーザーの vote を null にする
      ...Object.keys(roomData.users).reduce<Record<string, null>>((acc, uid) => {
        acc[`rooms/${roomId}/users/${uid}/vote`] = null;
        return acc;
      }, {}),
    };

    // DBを一括更新
    update(ref(db), updates);
  };

  const usersList = Object.entries(roomData?.users || {})
  const revealed = roomData?.status === 'revealed';

  const validVotes = usersList
    .map(([, user]) => user.vote)
    .filter(vote => typeof vote === 'number') as number[];
  const average = validVotes.length > 0
    ? (validVotes.reduce((sum, vote) => sum + vote, 0) / validVotes.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {roomData ? 
        <>
          {/* ヘッダー & 管理パネル */}
          <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-20 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
                    <span className="text-2xl">🃏</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-800">Planning Poker</h1>
                    <p className="text-xs text-gray-500 font-mono">Room: {roomId}</p>
                  </div>
                </div>
                
                {/* アクションボタン */}
                <div className="flex gap-3">
                  {!revealed ? (
                    <button 
                      onClick={revealCards}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <span>👁️</span>
                      <span>結果を見る</span>
                    </button>
                  ) : (
                    <button 
                      onClick={resetTable}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2.5 px-6 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <span>🔄</span>
                      <span>次のゲームへ</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>
      
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
            {/* ステータス表示 */}
            <div className="text-center mb-10">
              {revealed ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                  <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-2">結果</p>
                  <div className="text-5xl font-extrabold text-indigo-600 mb-2">
                    {average ?? '-'}
                  </div>
                  <p className="text-sm text-gray-400">平均値</p>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-3">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                    </span>
                    <p className="text-gray-600 font-semibold">投票受付中...</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {usersList.filter(([, u]) => u.vote !== null && u.vote !== undefined).length} / {usersList.length} 人が投票済み
                  </p>
                </div>
              )}
            </div>

            {/* メンバーリスト（テーブル） */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>👥</span>
                <span>参加メンバー</span>
                <span className="text-sm font-normal text-gray-500 ml-auto">
                  ({usersList.length}人)
                </span>
              </h2>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                {usersList.map(([uid, user]) => {
                  const hasVoted = user.vote !== undefined && user.vote !== null;
                  return (
                    <div 
                      key={uid} 
                      className={`
                        relative w-28 h-40 sm:w-32 sm:h-44 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300
                        ${hasVoted ? 'bg-gradient-to-br from-indigo-50 to-purple-50 -translate-y-2 shadow-xl border-2 border-indigo-200' : 'bg-gray-50 border-2 border-gray-200'}
                        ${revealed && user.vote === '?' ? 'border-yellow-400 bg-yellow-50' : ''}
                        ${!user.online ? 'opacity-40 grayscale' : ''}
                      `}
                    >
                      {/* カードの中身 */}
                      <div className={`
                        text-5xl font-bold mb-3 transition-all duration-300
                        ${revealed ? 'text-gray-800' : 'text-transparent'}
                        ${!revealed && hasVoted ? 'text-green-500' : ''}
                      `}>
                        {revealed 
                          ? user.vote ?? '-' 
                          : (hasVoted ? '✓' : '')}
                      </div>

                      {/* 名前 */}
                      <div className="absolute bottom-4 w-full text-center px-2">
                        <p className="text-sm font-bold text-gray-700 truncate">{user.name}</p>
                        {!user.online && (
                          <p className="text-xs text-gray-400 mt-1">オフライン</p>
                        )}
                      </div>
                      
                      {/* 投票済みバッジ（未開示時のみ） */}
                      {!revealed && hasVoted && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </main>

          {/* 自分の手札（投票エリア） */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-[0_-5px_30px_rgba(0,0,0,0.15)] border-t border-gray-200 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="max-w-3xl mx-auto">
                <p className="text-sm font-semibold text-gray-600 mb-4 text-center">
                  {revealed ? '結果が開示されました' : 'カードを選んで投票してください'}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 justify-center px-2">
                  {CARDS.map((card) => {
                    const isSelected = userId && roomData.users?.[userId]?.vote === card;
                    return (
                      <button
                        key={card}
                        onClick={() => handleVote(card)}
                        disabled={revealed}
                        className={`
                          shrink-0 w-16 h-24 sm:w-20 sm:h-28 rounded-xl font-bold text-2xl sm:text-3xl transition-all duration-200
                          border-2 shadow-lg
                          ${isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-700 -translate-y-4 shadow-indigo-300 scale-110' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-xl'}
                          ${revealed ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0' : 'hover:-translate-y-2'}
                        `}
                      >
                        {card}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
        : 
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
            <p className="text-gray-600 font-semibold">ルームデータを読み込んでいます...</p>
            <p className="text-sm text-gray-400 mt-2">しばらくお待ちください</p>
          </div>
        </div>
      }
    </div>
  );
}
