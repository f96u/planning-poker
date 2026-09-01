'use client';

import { ref, update, remove } from 'firebase/database';
import { logEvent } from 'firebase/analytics';
import { RefreshCw, Eye } from 'lucide-react';
import { db, analytics } from '@/lib/firebase';
import { createResetTimer } from '@/lib/timer';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/store/auth';
import { useRoomData } from '@/hooks/useRoomData';
import { useTimerState } from '@/hooks/useTimerState';
import { useTimerDocumentTitle } from '@/hooks/useTimerDocumentTitle';
import { PlayerCard } from './PlayerCard';
import { TimerStatusRow, TimerToggleButton } from './TimerControls';
import { BuyMeACoffeeLink } from '@/app/_components/BuyMeACoffeeLink';

type Props = {
  roomId: string;
};

export function Board({ roomId }: Props) {
  const user = useAtomValue(userAtom);
  const { roomData, isLoading } = useRoomData(roomId);
  // タイマー使用中は「投票受付中...」より残り時間の方が知りたい情報なので、その位置に表示する
  const timer = useTimerState(roomId);
  useTimerDocumentTitle(timer.running, timer.remainingMs, timer.isExpired);

  const usersList = Object.entries(roomData?.users || {});
  const revealed = roomData?.status === 'revealed';

  // オブザーバーではないユーザー（参加者）のみを対象にする
  const participatingUsers = usersList.filter(
    ([, user]) => !user.isObserver
  );

  const validVotes = participatingUsers
    .map(([, user]) => user.vote)
    .filter((vote) => typeof vote === 'number') as number[];
  const average =
    validVotes.length > 0
      ? Math.round(validVotes.reduce((sum, vote) => sum + vote, 0) / validVotes.length)
      : null;

  const handleRemovePlayer = (targetUid: string) => {
    if (!user || !roomId || targetUid === user.uid) return;
    const userRef = ref(db, `rooms/${roomId}/users/${targetUid}`);
    remove(userRef);
  };

  const handleNextGame = () => {
    if (!roomId || !roomData?.users) return;
    const updates: Record<string, unknown> = {
      [`rooms/${roomId}/status`]: 'voting',
      [`rooms/${roomId}/previousAverage`]: average,
      ...Object.keys(roomData.users).reduce<Record<string, null>>((acc, uid) => {
        acc[`rooms/${roomId}/users/${uid}/vote`] = null;
        return acc;
      }, {}),
    };
    update(ref(db), updates);
  };

  const handleRevealResults = () => {
    if (!roomId) return;
    const updates: Record<string, unknown> = { [`rooms/${roomId}/status`]: 'revealed' };
    // 議論は結果開示で終わりなので、タイマーを止めてリセットする
    if (roomData?.timer) {
      updates[`rooms/${roomId}/timer`] = createResetTimer(roomData.timer.durationSec);
    }
    update(ref(db), updates);


    // GAにイベント送信
    if (analytics) {
      logEvent(analytics, 'results_revealed');
    }
  };


  return (
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
      {/* 議論タイマーのON/OFF。補助的な機能なので右上に小さく置く */}
      {!isLoading && !revealed && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
          <TimerToggleButton timer={timer} />
        </div>
      )}

      {/* Buy Me a Coffee リンク */}
      {revealed && (
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex flex-col items-end gap-2 group z-10">
          <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800/90 text-white px-2 py-1 rounded pointer-events-none whitespace-nowrap relative font-semibold">
            開発者にコーヒーを奢る
            <span className="absolute bottom-0 right-1 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800/90"></span>
          </span>
          <BuyMeACoffeeLink sourcePage="room" iconOnly />
        </div>
      )}
      {/* 上部ステータスエリア */}
      <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3 text-center">
        {isLoading ? (
          <>
            <p className="text-sm sm:text-base text-gray-600 font-semibold">ルームデータを読み込んでいます...</p>
            <p className="text-[11px] sm:text-sm text-gray-400">しばらくお待ちください</p>
          </>
        ) : revealed ? (
          <>
            <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-widest font-bold">結果</p>
            <div className="text-3xl sm:text-5xl font-extrabold text-indigo-600">{average ?? '-'}</div>
            <p className="text-xs sm:text-sm text-gray-400">平均値</p>
            <div className="flex justify-center gap-2 sm:gap-3 pt-1.5 sm:pt-2">
              <button
                onClick={handleNextGame}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-4 sm:py-2 sm:px-5 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 inline-flex items-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" />
                <span>次のゲームへ</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* タイマーの有無で高さが変わらないよう、どちらも同じ高さの1行に収める。
                1行に収まらない狭い幅ではタイマー行だけ折り返す */}
            <div className="flex min-h-9 flex-wrap items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8">
              {timer.isEnabled ? (
                <TimerStatusRow timer={timer} />
              ) : (
                <>
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                  </span>
                  <p className="text-sm text-gray-600 font-semibold">投票受付中...</p>
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-400">
              {participatingUsers.filter(([, u]) => u.vote !== null && u.vote !== undefined).length} /{' '}
              {participatingUsers.length} 人が投票済み
            </p>
            {typeof roomData?.previousAverage === 'number' && (
              <p className="text-[11px] sm:text-sm text-gray-400">
                前回の平均: <span className="font-bold text-gray-500">{roomData.previousAverage}</span>
              </p>
            )}
            <div className="flex justify-center gap-2 sm:gap-3 pt-1.5 sm:pt-2">
              <button
                onClick={handleRevealResults}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 sm:py-2 sm:px-5 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 inline-flex items-center gap-1.5"
              >
                <Eye className="h-4 w-4" />
                <span>結果を見る</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 参加メンバー */}
      <div className="border-t border-gray-200 mt-3 pt-4" />
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        <span>参加メンバー（{usersList.length}人）</span>
      </h2>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {usersList.map(([uid, player]) => (
          <PlayerCard
            key={uid}
            uid={uid}
            player={player}
            isCurrentUser={uid === user?.uid}
            revealed={revealed}
            onRemove={handleRemovePlayer}
          />
        ))}
      </div>
    </div>
  );
}


