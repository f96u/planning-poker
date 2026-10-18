'use client';

import { AlarmClock, Timer as TimerIcon } from 'lucide-react';
import type { TimerState } from '../types/TimerState';

type Props = {
  timer: TimerState;
};

/**
 * useTimer が返すタイマーの状態に応じて、有効・無効を切り替える。
 * @param timer useTimer が返すタイマーの状態と操作
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
