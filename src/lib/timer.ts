import type { Timer } from '@/types';

// 設定できる時間（秒）。スライダーで 1分 〜 20分 を 1分刻みで選べる。
export const MIN_TIMER_DURATION_SEC = 60;
export const MAX_TIMER_DURATION_SEC = 20 * 60;
export const TIMER_DURATION_STEP_SEC = 60;

// 未設定のルームで初期表示する時間（秒）
export const DEFAULT_TIMER_DURATION_SEC = 5 * 60;

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
 * サーバー基準の現在時刻（epoch ms）を返す。
 * offset には useServerTimeOffset() の値を渡すこと。
 */
export function getServerNow(offset: number): number {
  return Date.now() + offset;
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
export function createResetTimer(durationSec: number): Timer {
  const sec = getDurationSec({ durationSec, remainingMs: 0, running: false });
  return {
    durationSec: sec,
    endsAt: null,
    remainingMs: sec * 1000,
    running: false,
  };
}

/** 設定時間を「7分30秒」のような日本語表記にする */
export function formatDuration(durationSec: number): string {
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  if (minutes === 0) return `${seconds}秒`;
  if (seconds === 0) return `${minutes}分`;
  return `${minutes}分${seconds}秒`;
}

/** 残り時間を mm:ss 形式の文字列にする（マイナスは 00:00 として扱う） */
export function formatRemaining(remainingMs: number): string {
  const totalSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
