import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

/**
 * 端末の時計とサーバー時刻の差分（ミリ秒）を返す。
 * `Date.now() + offset` でサーバー基準の現在時刻になるため、
 * 端末ごとの時計のズレに関係なく全員が同じ残り時間を見られる。
 */
export function useServerTimeOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // `.info` 配下は認証なしでも購読できる特別なパス
    const offsetRef = ref(db, '.info/serverTimeOffset');
    const unsubscribe = onValue(offsetRef, (snapshot) => {
      setOffset(snapshot.val() ?? 0);
    });

    return () => unsubscribe();
  }, []);

  return offset;
}
