'use client';

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useRoomData } from '@/hooks/useRoomData';

type Props = {
  roomId: string;
};

export function ConfettiCelebration({ roomId }: Props) {
  const { roomData } = useRoomData(roomId);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // ウィンドウサイズの取得
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  const usersList = Object.entries(roomData?.users || {});
  const revealed = roomData?.status === 'revealed';

  // オブザーバーではないユーザー（参加者）のみを対象にする
  const participatingUsers = usersList.filter(
    ([, user]) => !user.isObserver
  );

  const validVotes = participatingUsers
    .map(([, user]) => user.vote)
    .filter((vote) => typeof vote === 'number') as number[];

  // 全員の投票が一致しているかチェック
  const allVotesMatch =
    revealed &&
    validVotes.length >= 2 &&
    validVotes.every((vote) => vote === validVotes[0]);

  if (!allVotesMatch || windowSize.width === 0 || windowSize.height === 0) {
    return null;
  }

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={500}
      gravity={0.3}
    />
  );
}
