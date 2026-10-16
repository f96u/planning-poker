import { useState, useEffect, useRef } from 'react';
import { ref, set, remove } from 'firebase/database';
import { useAtomValue } from 'jotai';
import { db } from '@/lib/firebase';
import { userAtom } from '@/store/auth';
import { useRoomData } from '@/hooks/useRoomData';
import { useServerTimeOffset } from '@/hooks/useServerTimeOffset';
import {
  formatRemaining,
  getServerNow,
} from '@/lib/timer';
import type { Timer } from '@/types';

// 残りがこの時間以下になったら警告色にする
const WARNING_THRESHOLD_MS = 60 * 1000;

// カウントダウンの更新間隔（ミリ秒）
const TICK_INTERVAL_MS = 250;

// 未設定のルームで初期表示する時間（秒）
export const DEFAULT_TIMER_DURATION_SEC = 5 * 60;

// 設定できる時間（秒）。スライダーで 1分 〜 20分 を 1分刻みで選べる。
export const MIN_TIMER_DURATION_SEC = 60;
export const MAX_TIMER_DURATION_SEC = 20 * 60;
export const TIMER_DURATION_STEP_SEC = 60;

/**
 * 設定時間（秒）を取得する。
 * 未設定・不正値の場合はデフォルト値に、範囲外の場合は上下限に丸める。
 */
export function getDurationSec(timer?: Timer): number {
  const durationSec = timer?.durationSec;
  if (typeof durationSec !== 'number' || durationSec <= 0) return DEFAULT_TIMER_DURATION_SEC;
  return Math.min(Math.max(durationSec, MIN_TIMER_DURATION_SEC), MAX_TIMER_DURATION_SEC);
}

/**
 * 残り時間（ミリ秒）を求める。
 * now には端末の時計のズレを補正した現在時刻を渡すこと。
 * 時間切れの判定に使うため、マイナス値はそのまま返す。
 */
export function getRemainingMs(timer: Timer | undefined, now: number): number {
  const fullMs = getDurationSec(timer) * 1000;
  if (!timer) return fullMs;
  if (timer.running && typeof timer.endsAt === 'number') return timer.endsAt - now;
  return typeof timer.remainingMs === 'number' ? timer.remainingMs : fullMs;
}

/**
 * 停止してリセットした状態のタイマーを作る。
 * 次のラウンドでも同じ時間で始められるよう、設定時間は引き継ぐ。
 */
function createResetTimer(durationSec: number): Timer {
  const sec = getDurationSec({ durationSec, remainingMs: 0, running: false });
  return {
    durationSec: sec,
    endsAt: null,
    remainingMs: sec * 1000,
    running: false,
  };
}

/**
 * ルームで共有している議論タイマーの状態・操作とドキュメントタイトルを管理する。
 */
export function useTimer(roomId: string) {
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

  const titlePrefix = running
    ? `${isExpired ? '⏰' : '⏱'} ${formatRemaining(remainingMs)}`
    : '';
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

export type TimerState = ReturnType<typeof useTimer>;
