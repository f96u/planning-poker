'use client';

import { useEffect } from 'react';
import { ref, update, onDisconnect } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

type Props = {
  roomId: string;
};

/**
 * ルームへの入室処理を担当するコンポーネント
 * このコンポーネントがマウントされると、自動的にルームに入室します
 * ユーザーが認証されたら自動的にルームに入室し、切断時にオフライン状態を設定します
 */
export function RoomEntry({ roomId }: Props) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `rooms/${roomId}/users/${user.uid}`);
    update(userRef, {
      online: true,
    });
    onDisconnect(userRef).update({ online: false });
  }, [roomId, user]);

  return null;
}
