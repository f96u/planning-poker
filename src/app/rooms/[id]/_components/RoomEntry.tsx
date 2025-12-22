'use client';

import { useEffect } from 'react';
import { ref, update, onDisconnect } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/store/auth';

type Props = {
  roomId: string;
};

/**
 * ルームへの入室処理を担当するコンポーネント
 * このコンポーネントがマウントされると、自動的にルームに入室します
 * ユーザーが認証されたら自動的にルームに入室し、切断時にオフライン状態を設定します
 */
export function RoomEntry({ roomId }: Props) {
  const user = useAtomValue(userAtom);

  useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `rooms/${roomId}/users/${user.uid}`);

    // ユーザーをオンライン状態にする
    update(userRef, {
      online: true,
    });

    // 切断時のハンドラを設定
    const disconnectHandler = onDisconnect(userRef);
    disconnectHandler.update({ online: false });

    // クリーンアップ関数：コンポーネントのアンマウント時や依存配列の値が変わった時にonDisconnectをキャンセル
    return () => {
      disconnectHandler.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.uid]); // user.uidのみを依存配列にすることで、同じユーザーIDの場合は再実行されない

  return null;
}
