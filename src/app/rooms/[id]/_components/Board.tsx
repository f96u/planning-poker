'use client';

import { useState, useEffect } from 'react';
import { ref, update, onDisconnect, onValue, remove } from 'firebase/database';
import { RefreshCw, Eye, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { Room } from '@/types';
import { useAuth } from '@/hooks/useAuth';

type Props = {
  roomId: string;
};

export function Board({ roomId }: Props) {
  const [roomData, setRoomData] = useState<Room | null>(null);
  const { user, loading: authLoading } = useAuth();

  // 入室処理
  useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `rooms/${roomId}/users/${user.uid}`);
    update(userRef, {
      online: true,
    });
    onDisconnect(userRef).update({ online: false });
  }, [roomId, user]);

  // リアルタイム同期
  useEffect(() => {
    // 認証前の場合はデータ取得ができないためリアルタイム同期を停止
    if (!user) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as Room | null;
      setRoomData(data);
    });

    return () => unsubscribe();
  }, [roomId, user]);

  const usersList = Object.entries(roomData?.users || {});
  const revealed = roomData?.status === 'revealed';

  const validVotes = usersList
    .map(([, user]) => user.vote)
    .filter((vote) => typeof vote === 'number') as number[];
  const average =
    validVotes.length > 0
      ? (validVotes.reduce((sum, vote) => sum + vote, 0) / validVotes.length).toFixed(1)
      : null;

  const isLoading = authLoading || !roomData;

  const handleRemovePlayer = (targetUid: string) => {
    if (!user || !roomId || targetUid === user.uid) return;
    const userRef = ref(db, `rooms/${roomId}/users/${targetUid}`);
    remove(userRef);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
      {/* 上部ステータスエリア */}
      <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3 text-center">
        {isLoading ? (
          <>
            <p className="text-sm sm:text-base text-gray-600 font-semibold">ルームデータを読み込んでいます...</p>
            <p className="text-[11px] sm:text-sm text-gray-400">しばらくお待ちください</p>
          </>
        ) : revealed ? (
          <>
            <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-widest font-bold">結果</p>
            <div className="text-3xl sm:text-5xl font-extrabold text-indigo-600">{average ?? '-'}</div>
            <p className="text-xs sm:text-sm text-gray-400">平均値</p>
            <div className="flex justify-center gap-2 sm:gap-3 pt-1.5 sm:pt-2">
              <button
                onClick={() => {
                  if (!roomId || !roomData?.users) return;
                  const updates: Record<string, unknown> = {
                    [`rooms/${roomId}/status`]: 'voting',
                    ...Object.keys(roomData.users).reduce<Record<string, null>>((acc, uid) => {
                      acc[`rooms/${roomId}/users/${uid}/vote`] = null;
                      return acc;
                    }, {}),
                  };
                  update(ref(db), updates);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-4 sm:py-2 sm:px-5 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 inline-flex items-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" />
                <span>次のゲームへ</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
              </span>
              <p className="text-sm text-gray-600 font-semibold">投票受付中...</p>
            </div>
            <p className="text-[11px] text-gray-400">
              {usersList.filter(([, u]) => u.vote !== null && u.vote !== undefined).length} /{' '}
              {usersList.length} 人が投票済み
            </p>
            <div className="flex justify-center gap-2 sm:gap-3 pt-1.5 sm:pt-2">
              <button
                onClick={() => {
                  if (!roomId) return;
                  update(ref(db), { [`rooms/${roomId}/status`]: 'revealed' });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 sm:py-2 sm:px-5 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 inline-flex items-center gap-1.5"
              >
                <Eye className="h-4 w-4" />
                <span>結果を見る</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 参加メンバー */}
      <div className="border-t border-gray-200 mt-3 pt-4" />
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        <span>参加メンバー（{usersList.length}人）</span>
      </h2>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {usersList.map(([uid, player]) => {
          const hasVoted = player.vote !== undefined && player.vote !== null;
          const isCurrentUser = uid === user?.uid;
          return (
            <div
              key={uid}
              className={`
                relative w-24 h-36 sm:w-28 sm:h-40 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300
                ${
                  isCurrentUser
                    ? hasVoted
                      ? 'bg-linear-to-br from-indigo-50 to-purple-50 -translate-y-2 shadow-xl border-2 border-blue-400'
                      : 'bg-gray-50 border-2 border-blue-400'
                    : hasVoted
                    ? 'bg-linear-to-br from-indigo-50 to-purple-50 -translate-y-2 shadow-xl border-2 border-indigo-200'
                    : 'bg-gray-50 border-2 border-gray-200'
                }
                ${revealed && player.vote === '?' && !isCurrentUser ? 'border-yellow-400 bg-yellow-50' : ''}
                ${revealed && player.vote === '?' && isCurrentUser ? 'border-blue-400 bg-yellow-50' : ''}
                ${!player.online ? 'opacity-40 grayscale' : ''}
              `}
            >
              {/* 削除ボタン（自分以外の場合のみ表示） */}
              {!isCurrentUser && (
                <button
                  onClick={() => handleRemovePlayer(uid)}
                  className="absolute top-2 right-2 w-7 h-7 sm:w-6 sm:h-6 bg-gray-200/80 hover:bg-red-500 active:bg-red-600 text-gray-600 hover:text-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md z-10 transition-all duration-200 touch-manipulation"
                  title="プレイヤーを削除"
                  aria-label={`${player.name ?? 'ゲスト'}を削除`}
                >
                  <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              )}

              {/* カードの中身 */}
              <div
                className={`
                  text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 transition-all duration-300
                  ${revealed ? 'text-gray-800' : 'text-transparent'}
                  ${!revealed && hasVoted ? 'text-green-500' : ''}
                `}
              >
                {revealed ? player.vote ?? '-' : hasVoted ? '✓' : ''}
              </div>

              {/* 名前 */}
              <div className="absolute bottom-3 sm:bottom-4 w-full text-center px-2">
                {isCurrentUser && (
                  <p className="text-[10px] text-blue-600 font-semibold mt-0.5">あなた</p>
                )}
                <p className="text-xs sm:text-sm font-bold text-gray-700 truncate">{player.name ?? 'ゲスト'}</p>
                
                {!player.online && (
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
  );
}


