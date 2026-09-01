import { useEffect, useRef } from 'react';
import { formatRemaining } from '@/lib/timer';

/**
 * 別タブを見ている人にも残り時間が見えるよう、計測中はタブのタイトルに残り時間を出す。
 * 秒が変わったときだけ書き換わるよう、依存配列には整形後の文字列を渡している。
 */
export function useTimerDocumentTitle(running: boolean, remainingMs: number, isExpired: boolean) {
  const titlePrefix = running ? `${isExpired ? '⏰' : '⏱'} ${formatRemaining(remainingMs)}` : '';
  const originalTitleRef = useRef<string | null>(null);

  useEffect(() => {
    // 計測中でなければ、書き換えていた場合のみ元のタイトルに戻す
    if (!titlePrefix) {
      if (originalTitleRef.current !== null) {
        document.title = originalTitleRef.current;
        originalTitleRef.current = null;
      }
      return;
    }
    // 元のタイトルは書き換える前の一度だけ覚える（毎秒の更新で上書きしない）
    if (originalTitleRef.current === null) originalTitleRef.current = document.title;
    document.title = `${titlePrefix} | ${originalTitleRef.current}`;
  }, [titlePrefix]);

  // ルームを離れるときにタイトルを戻す
  useEffect(() => () => {
    if (originalTitleRef.current !== null) document.title = originalTitleRef.current;
  }, []);
}
