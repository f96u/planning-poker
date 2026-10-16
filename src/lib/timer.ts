import type { Timer } from '@/types';

/**
 * サーバー基準の現在時刻（epoch ms）を返す。
 * offset には useServerTimeOffset() の値を渡すこと。
 */
export function getServerNow(offset: number): number {
  return Date.now() + offset;
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
