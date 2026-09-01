'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AlarmClock, Pause, Play, RotateCcw, Timer as TimerIcon } from 'lucide-react';
import type { TimerState } from '@/hooks/useTimerState';
import {
  MAX_TIMER_DURATION_SEC,
  MIN_TIMER_DURATION_SEC,
  TIMER_DURATION_STEP_SEC,
  formatDuration,
  formatRemaining,
} from '@/lib/timer';

// スライダー操作を書き込みにまとめるまでの待ち時間（ミリ秒）
const SLIDER_COMMIT_DELAY_MS = 250;

// スライダーの目盛り（秒）。対応ブラウザでは5分刻みの印が出て、狙いを付けやすくなる
const SLIDER_TICK_INTERVAL_SEC = 5 * 60;
const SLIDER_TICKS_SEC = Array.from(
  { length: Math.floor(MAX_TIMER_DURATION_SEC / SLIDER_TICK_INTERVAL_SEC) },
  (_, i) => (i + 1) * SLIDER_TICK_INTERVAL_SEC
);

const CONTROL_BUTTON_CLASS =
  'inline-flex shrink-0 items-center rounded-full border border-gray-300 bg-white p-1.5 text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

type Props = {
  timer: TimerState;
};

/**
 * ボードの右上に置く議論タイマーのON/OFFトグル。
 * ONでタイマー行が出て、OFFでルーム全員の表示から消える。
 */
export function TimerToggleButton({ timer }: Props) {
  const { isEnabled, isExpired, canControl, enable, disable } = timer;

  return (
    <button
      type="button"
      onClick={isEnabled ? disable : enable}
      disabled={!canControl}
      aria-pressed={isEnabled}
      aria-label="議論タイマー"
      title={isEnabled ? '議論タイマーをオフにする' : '議論タイマーを使う'}
      className={`
        inline-flex items-center justify-center rounded-full border p-1.5 shadow-sm transition-colors
        ${
          isExpired
            ? 'border-red-300 bg-red-50 text-red-600'
            : isEnabled
            ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
            : 'border-gray-200 bg-white/80 text-gray-400 hover:border-gray-300 hover:text-gray-600'
        }
        ${canControl ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
      `}
    >
      {isExpired ? (
        <AlarmClock className="h-4 w-4 animate-pulse" />
      ) : (
        <TimerIcon className="h-4 w-4" />
      )}
    </button>
  );
}

/**
 * 「投票受付中...」と同じ位置に出すタイマー行。
 * 停止中は設定時間のスライダー、計測中は進捗バーを同じ場所に出す。
 * 1行に収まらない狭い幅では、スライダー/進捗バーだけが2行目に折り返す。
 */
export function TimerStatusRow({ timer }: Props) {
  const {
    durationSec,
    remainingMs,
    running,
    isExpired,
    isWarning,
    isPaused,
    isActive,
    progress,
    canControl,
    start,
    stop,
    reset,
    setDuration,
  } = timer;

  const tickListId = useId();

  // スライダーはドラッグ中の値をローカルに持ち、少し待ってからまとめて書き込む
  const [draftDurationSec, setDraftDurationSec] = useState<number | null>(null);
  const commitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
  }, []);

  const handleChangeDuration = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canControl) return;
    const nextDurationSec = Number(event.target.value);
    setDraftDurationSec(nextDurationSec);

    if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
    commitTimeoutRef.current = setTimeout(() => {
      setDuration(nextDurationSec);
      setDraftDurationSec(null);
    }, SLIDER_COMMIT_DELAY_MS);
  };

  // ドラッグ中は書き込み前の値を表示して、つまみと数字が戻らないようにする
  const sliderDurationSec = draftDurationSec ?? durationSec;
  const displayMs = draftDurationSec !== null ? draftDurationSec * 1000 : remainingMs;

  const timeColor = isExpired ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-800';
  const barColor = isExpired ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500';

  return (
    <>
      {isExpired ? (
        <AlarmClock className="h-5 w-5 shrink-0 text-red-600 animate-pulse" />
      ) : isPaused ? (
        <Pause className="h-5 w-5 shrink-0 text-gray-400" />
      ) : (
        <TimerIcon className="h-5 w-5 shrink-0 text-indigo-500" />
      )}

      <span
        className={`text-xl sm:text-2xl font-extrabold tabular-nums ${timeColor} ${
          isExpired ? 'animate-pulse' : ''
        }`}
      >
        {formatRemaining(displayMs)}
      </span>

      {/* 1行に収まらない狭い幅では、スライダー/進捗バーだけを2行目に折り返して全幅で表示する */}
      <div className="order-last flex w-full shrink-0 justify-center sm:order-none sm:w-auto">
        {running ? (
          <div className="h-1.5 w-full max-w-64 overflow-hidden rounded-full bg-gray-200 sm:w-40">
            <div
              className={`h-full rounded-full transition-[width] duration-200 ease-linear ${barColor}`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        ) : (
          <>
            <input
              type="range"
              min={MIN_TIMER_DURATION_SEC}
              max={MAX_TIMER_DURATION_SEC}
              step={TIMER_DURATION_STEP_SEC}
              list={tickListId}
              value={sliderDurationSec}
              onChange={handleChangeDuration}
              disabled={!canControl}
              aria-label="タイマーの設定時間"
              title={`設定時間 ${formatDuration(sliderDurationSec)}`}
              className="w-full max-w-64 cursor-pointer accent-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-40"
            />
            <datalist id={tickListId}>
              {SLIDER_TICKS_SEC.map((tickSec) => (
                <option key={tickSec} value={tickSec} />
              ))}
            </datalist>
          </>
        )}
      </div>

      {running && !isExpired ? (
        <button
          onClick={stop}
          disabled={!canControl}
          title="ストップ"
          aria-label="ストップ"
          className={CONTROL_BUTTON_CLASS}
        >
          <Pause className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          onClick={start}
          disabled={!canControl}
          title={isPaused ? '再開' : '開始'}
          aria-label={isPaused ? '再開' : '開始'}
          className={CONTROL_BUTTON_CLASS}
        >
          <Play className="h-3.5 w-3.5" />
        </button>
      )}

      <button
        onClick={reset}
        disabled={!canControl || !isActive}
        title="リセット"
        aria-label="リセット"
        className={CONTROL_BUTTON_CLASS}
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </>
  );
}
