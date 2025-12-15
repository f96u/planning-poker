'use client';

import { useEffect, useState } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Room } from '@/types';
import { useAuth } from '@/hooks/useAuth';

// フィボナッチ数列のカード
const CARDS = [1, 2, 3, 5, 8, 13, 21, '?'];

type Props = {
  roomId: string;
};

export function Hand({ roomId }: Props) {
  const [roomData, setRoomData] = useState<Room | null>(null);
  const { user, loading: authLoading } = useAuth();
  const [editingName, setEditingName] = useState('');

  // リアルタイム同期
  useEffect(() => {
    if (!user) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as Room | null;
      setRoomData(data);
    });

    return () => unsubscribe();
  }, [roomId, user]);

  const revealed = roomData?.status === 'revealed';
  const isLoading = authLoading || !roomData;
  const currentName =
    (user && roomData?.users?.[user.uid]?.name) || 'ゲスト';

  const handleNameFocus = () => {
    // 初回フォーカス時に名前が未入力なら現在の名前で初期化
    if (editingName === '' && currentName) {
      setEditingName(currentName);
    }
  };

  const handleNameBlur = () => {
    if (!user) return;
    const trimmed = editingName.trim() || currentName || 'ゲスト';
    setEditingName(trimmed);
    const userRef = ref(db, `rooms/${roomId}/users/${user.uid}`);
    update(userRef, { name: trimmed, online: true });
  };

  const handleVote = (card: number | string) => {
    if (!user) return;
    const userRef = ref(db, `rooms/${roomId}/users/${user.uid}`);
    update(userRef, {
      vote: card,
      online: true,
    });
  };

  return (
    <>
      {/* 自分の名前編集 */}
      <div className="max-w-md mx-auto mb-4 flex items-center gap-2">
        <label className="text-sm text-gray-600 whitespace-nowrap">あなたの名前</label>
        <input
          type="text"
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          onFocus={handleNameFocus}
          onBlur={handleNameBlur}
          placeholder="名前を入力"
          className="flex-1 font-semibold rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        />
      </div>

      <p className="text-sm font-semibold text-gray-600 mb-2 text-center">
        {revealed ? '結果が開示されました' : 'カードを選んで投票してください'}
      </p>
      <div className="flex gap-3 overflow-x-auto pb-3 pt-6 justify-center px-2">
        {CARDS.map((card) => {
          const isSelected = user && roomData?.users?.[user.uid]?.vote === card;
          return (
            <button
              key={card}
              onClick={() => handleVote(card)}
              disabled={revealed || isLoading}
              className={`
                shrink-0 w-16 h-24 sm:w-20 sm:h-28 rounded-xl font-bold text-2xl sm:text-3xl transition-all duration-200
                border-2 shadow-lg
                ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 -translate-y-4 shadow-indigo-300 scale-110'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-xl'
                }
                ${
                  revealed || isLoading
                    ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0'
                    : 'hover:-translate-y-2'
                }
              `}
            >
              {card}
            </button>
          );
        })}
      </div>
    </>
  );
}


