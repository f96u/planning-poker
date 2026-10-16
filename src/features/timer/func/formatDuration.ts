/** 設定時間を「7分30秒」のような日本語表記にする */
export function formatDuration(durationSec: number): string {
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  if (minutes === 0) return `${seconds}秒`;
  if (seconds === 0) return `${minutes}分`;
  return `${minutes}分${seconds}秒`;
}
