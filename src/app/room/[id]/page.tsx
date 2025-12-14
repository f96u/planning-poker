'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ref, update, onDisconnect, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Room } from '@/types';

// フィボナッチ数列のカード
const CARDS = [1, 2, 3, 5, 8, 13, 21, '?']

// userIdの初期化関数
function getInitialUserId(): string {
  if (typeof window === 'undefined') {
    return 'user_' + Math.random().toString(36).substring(2, 9);
  }
  const storedUid = localStorage.getItem('poker_uid');
  if (!storedUid) {
    const newUid = 'user_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('poker_uid', newUid);
    return newUid;
  }
  return storedUid;
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [userId] = useState<string>(getInitialUserId);
  const [myName, setMyName] = useState('ゲスト');

  // 入室処理（myName変更時も再実行）
  useEffect(() => {
    if (!userId) return;

    // DB上の自分の場所
    const userRef = ref(db, `rooms/${roomId}/users/${userId}`);

    // 入室書き込み
    update(userRef, {
      name: myName,
      online: true,
    });

    // ブラウザを閉じたら自動でオフラインにする予約
    onDisconnect(userRef).update({
      online: false,
    });
  }, [myName, roomId, userId]);

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
    .map(([_, user]) => user.vote)
    .filter(vote => typeof vote === 'number') as number[];
  const average = validVotes.length > 0
    ? (validVotes.reduce((sum, vote) => sum + vote, 0) / validVotes.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {roomData ? 
        <>
          {/* ヘッダー & 管理パネル */}
          <header className="bg-white shadow p-4 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-10">
            <div>
              <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                🃏 Room: <span className="font-mono bg-gray-100 px-2 rounded text-sm">{roomId}</span>
              </h1>
            </div>
            
            {/* アクションボタン */}
            <div className="flex gap-3 mt-4 sm:mt-0">
              {!revealed ? (
                <button 
                  onClick={revealCards}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full shadow transition-all active:scale-95"
                >
                  結果を見る (Open)
                </button>
              ) : (
                <button 
                  onClick={resetTable}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full shadow transition-all active:scale-95 flex items-center gap-2"
                >
                  🔄 次のゲームへ (Reset)
                </button>
              )}
            </div>
          </header>
      
          <main className="max-w-5xl mx-auto p-4 sm:p-8">
            {/* ステータス表示 */}
            <div className="text-center mb-8">
              {revealed ? (
                <div className="animate-fade-in-up">
                  <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Result</p>
                  <div className="text-4xl font-extrabold text-indigo-600">
                    平均: {average ?? '-'}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 font-medium flex items-center justify-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  投票受付中...
                </div>
              )}
            </div>

            {/* メンバーリスト（テーブル） */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {usersList.map(([uid, user]) => {
                const hasVoted = user.vote !== undefined && user.vote !== null;
                return (
                  <div 
                    key={uid} 
                    className={`
                      relative w-28 h-40 rounded-xl shadow-md flex flex-col items-center justify-center transition-all duration-300
                      ${hasVoted ? 'bg-white -translate-y-1' : 'bg-gray-100'}
                      ${revealed && user.vote === '?' ? 'border-2 border-yellow-400' : ''}
                      ${!user.online ? 'opacity-40 grayscale' : ''}
                    `}
                  >
                    {/* カードの中身 */}
                    <div className={`
                      text-4xl font-bold mb-2
                      ${revealed ? 'text-gray-800' : 'text-transparent'}
                      ${!revealed && hasVoted ? 'text-green-500' : ''}
                    `}>
                      {revealed 
                        ? user.vote ?? '-' 
                        : (hasVoted ? '✔' : '')}
                    </div>

                    {/* 名前 */}
                    <div className="absolute bottom-3 w-full text-center px-2">
                      <p className="text-xs font-bold text-gray-500 truncate">{user.name}</p>
                    </div>
                    
                    {/* 投票済みバッジ（未開示時のみ） */}
                    {!revealed && hasVoted && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </main>

          {/* 自分の手札（投票エリア） */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] border-t border-gray-200">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3 overflow-x-auto pb-2 justify-start sm:justify-center px-2">
                {CARDS.map((card) => {
                  const isSelected = userId && roomData.users?.[userId]?.vote === card;
                  return (
                    <button
                      key={card}
                      onClick={() => handleVote(card)}
                      disabled={revealed} // 開示後は投票禁止
                      className={`
                        flex-shrink-0 w-12 h-16 sm:w-16 sm:h-24 rounded-lg font-bold text-xl sm:text-2xl transition-all duration-200
                        border-2 shadow-sm
                        ${isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-600 -translate-y-3 shadow-indigo-200' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}
                        ${revealed ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {card}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
        : 
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">ルームデータを読み込んでいます...</p>
        </div>
      }
    </div>
  );
}