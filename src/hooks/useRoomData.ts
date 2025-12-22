import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { useAtomValue } from 'jotai';
import { db } from '@/lib/firebase';
import { Room } from '@/types';
import { userAtom, authLoadingAtom } from '@/store/auth';

export function useRoomData(roomId: string) {
  const [roomData, setRoomData] = useState<Room | null>(null);
  const user = useAtomValue(userAtom);
  const authLoading = useAtomValue(authLoadingAtom);

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

  const isLoading = authLoading || !roomData;

  return { roomData, isLoading };
}
