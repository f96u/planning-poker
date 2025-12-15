'use client';

import { useState } from 'react';
import { ref, push, serverTimestamp, set } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export function CreateRoomButton() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const createRoom = async () => {
    // 認証前の場合は部屋作成権限がないため処理停止
    if (!user) return;

    setIsCreating(true);
    try {
      const newRoomRef = push(ref(db, 'rooms'));
      await set(newRoomRef, {
        createdAt: serverTimestamp(),
        status: 'voting', // voting, revealed
        users: {},
      });

      const roomId = newRoomRef.key;
      router.push(`/rooms/${roomId}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      setIsCreating(false);
    }
  };

  return (
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
  );
}


