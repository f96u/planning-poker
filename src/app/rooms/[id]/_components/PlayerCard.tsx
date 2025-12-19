'use client';

import { X } from 'lucide-react';
import { User } from '@/types';

type Props = {
  uid: string;
  player: User;
  isCurrentUser: boolean;
  revealed: boolean;
  onRemove: (uid: string) => void;
};

export function PlayerCard({ uid, player, isCurrentUser, revealed, onRemove }: Props) {
  const hasVoted = player.vote !== undefined && player.vote !== null;
  const isObserver = !!player.isObserver; // デフォルトはfalse（参加者）

  return (
    <div
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
        ${isObserver ? 'opacity-60 border-dashed' : ''}
      `}
    >
      {/* 削除ボタン（自分以外の場合のみ表示） */}
      {!isCurrentUser && (
        <button
          onClick={() => onRemove(uid)}
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
        {isObserver && (
          <p className="text-xs text-gray-500 mt-1 font-semibold">非参加</p>
        )}
      </div>

      {/* 投票済みバッジ（未開示時のみ） */}
      {!revealed && hasVoted && (
        <div className="absolute top-3 right-3 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
      )}
    </div>
  );
}
