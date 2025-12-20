'use client';

import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useRoomData } from '@/hooks/useRoomData';

// フィボナッチ数列のカード
const CARDS = [1, 2, 3, 5, 8, 13, 21, '?'];

type Props = {
  roomId: string;
};

export function Hand({ roomId }: Props) {
  const { user } = useAuth();
  const { roomData, isLoading } = useRoomData(roomId);
  const [editingName, setEditingName] = useState('');

  const revealed = roomData?.status === 'revealed';
  const currentName =
    (user && roomData?.users?.[user.uid]?.name) || 'ゲスト';
  const isObserver = !!(user && roomData?.users?.[user.uid]?.isObserver); // デフォルトはfalse（参加者）

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
    if (!user || isObserver) return;
    const userRef = ref(db, `rooms/${roomId}/users/${user.uid}`);
    update(userRef, {
      vote: card,
      online: true,
    });
  };

  const handleToggleObserver = () => {
    if (!user) return;
    const userRef = ref(db, `rooms/${roomId}/users/${user.uid}`);
    const newIsObserver = !isObserver;
    update(userRef, {
      isObserver: newIsObserver,
      online: true,
      // オブザーバーになる場合は投票もクリア
      ...(newIsObserver ? { vote: null } : {}),
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

      {/* オブザーバーモードトグル */}
      <div className="max-w-md mx-auto mb-4 flex items-center justify-center gap-2">
        <label className="text-sm text-gray-600 font-semibold">非参加モード</label>
        <button
          onClick={handleToggleObserver}
          disabled={isLoading}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isObserver ? 'bg-indigo-600' : 'bg-gray-300'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          role="switch"
          aria-checked={isObserver ?? false}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isObserver ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      <p className="text-sm font-semibold text-gray-600 mb-2 text-center">
        {revealed
          ? '結果が開示されました'
          : isObserver
          ? '非参加モードです（投票には参加しません）'
          : 'カードを選んで投票してください'}
      </p>
      <div className="flex flex-wrap justify-center gap-3 px-2 pt-4 pb-3 sm:flex-nowrap">
        {CARDS.map((card) => {
          const isSelected = user && roomData?.users?.[user.uid]?.vote === card;
          return (
            <button
              key={card}
              onClick={() => handleVote(card)}
              disabled={revealed || isLoading || isObserver}
              className={`
                shrink-0 w-16 h-24 md:w-20 md:h-28 rounded-xl font-bold text-2xl md:text-3xl transition-all duration-200
                border-2 shadow-lg
                ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 -translate-y-4 shadow-indigo-300 scale-110'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-xl'
                }
                ${
                  revealed || isLoading || isObserver
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


