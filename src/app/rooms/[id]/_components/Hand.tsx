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

  // リアルタイム同期（手札エリア用）
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


