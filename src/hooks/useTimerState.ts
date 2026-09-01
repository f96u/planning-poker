import { useState, useEffect } from 'react';
import { ref, set, remove } from 'firebase/database';
import { useAtomValue } from 'jotai';
import { db } from '@/lib/firebase';
import { userAtom } from '@/store/auth';
import { useRoomData } from '@/hooks/useRoomData';
import { useServerTimeOffset } from '@/hooks/useServerTimeOffset';
import { createResetTimer, getDurationSec, getRemainingMs, getServerNow } from '@/lib/timer';

// 残りがこの時間以下になったら警告色にする
const WARNING_THRESHOLD_MS = 60 * 1000;

// カウントダウンの更新間隔（ミリ秒）
const TICK_INTERVAL_MS = 250;

/**
 * ルームで共有している議論タイマーの状態と操作をまとめる。
 * ヘッダーのタイマーとボードの表示で同じ値・同じ操作を使うために切り出している。
 */
export function useTimerState(roomId: string) {
  const { roomData } = useRoomData(roomId);
  const offset = useServerTimeOffset();
  const user = useAtomValue(userAtom);

  const timer = roomData?.timer;
  const running = !!timer?.running;
  const hasTimer = !!timer;

  // カウントダウンを進めるための現在時刻。
  // 停止中も更新し続けることで、開始した瞬間に古い時刻で描画されるのを防ぐ。
  const [now, setNow] = useState(() => getServerNow(0));
  useEffect(() => {
    if (!hasTimer) return;

    const intervalId = setInterval(() => setNow(getServerNow(offset)), TICK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [hasTimer, offset]);

  const durationSec = getDurationSec(timer);
  const remainingMs = getRemainingMs(timer, now);
  const isExpired = running && remainingMs <= 0;
  const isWarning = running && !isExpired && remainingMs <= WARNING_THRESHOLD_MS;
  // 一時停止中（設定時間の途中で止まっている状態）
  const isPaused = !running && remainingMs < durationSec * 1000;
  // 計測が始まっている状態
  const isActive = running || isPaused;
  const progress = Math.max(0, Math.min(1, remainingMs / (durationSec * 1000)));

  const writeTimer = (nextRemainingMs: number, nextRunning: boolean) => {
    if (!user) return;
    set(ref(db, `rooms/${roomId}/timer`), {
      durationSec,
      // 実行中は終了時刻をサーバー基準の絶対時刻で持つことで、全員の残り時間が一致する
      endsAt: nextRunning ? getServerNow(offset) + nextRemainingMs : null,
      remainingMs: nextRemainingMs,
      running: nextRunning,
    });
  };

  /** 開始・再開する。時間切れ後や0秒からの場合は設定時間で仕切り直す */
  const start = () => writeTimer(remainingMs > 0 ? remainingMs : durationSec * 1000, true);

  /** 残り時間を保ったまま止める */
  const stop = () => writeTimer(Math.max(0, remainingMs), false);

  /** 設定時間まで巻き戻して止める */
  const reset = () => {
    if (!user) return;
    set(ref(db, `rooms/${roomId}/timer`), createResetTimer(durationSec));
  };

  /** 設定時間を変更する（変更すると計測はリセットされる） */
  const setDuration = (nextDurationSec: number) => {
    if (!user) return;
    set(ref(db, `rooms/${roomId}/timer`), createResetTimer(nextDurationSec));
  };

  /** タイマーを使う状態にする（まだ計測は始めない） */
  const enable = () => {
    if (!user) return;
    set(ref(db, `rooms/${roomId}/timer`), createResetTimer(durationSec));
  };

  /** タイマーを使わない状態にする。ノードごと消すことで全員の表示から消える */
  const disable = () => {
    if (!user) return;
    remove(ref(db, `rooms/${roomId}/timer`));
  };

  return {
    roomData,
    durationSec,
    // タイマーを使う状態か（ルーム全員で共有）
    isEnabled: hasTimer,
    remainingMs,
    running,
    isExpired,
    isWarning,
    isPaused,
    isActive,
    progress,
    // 未認証だと書き込めないため、ボタンの活性判定に使う
    canControl: !!user,
    start,
    stop,
    reset,
    setDuration,
    enable,
    disable,
  };
}

export type TimerState = ReturnType<typeof useTimerState>;
