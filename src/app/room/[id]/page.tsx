'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ref, update, onDisconnect, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Room } from '@/types';

// フィボナッチ数列のカード
const CARDS = [1, 2, 3, 5, 8, 13, 21, '?']

// userIdの初期化関数
function getInitialUserId(): string {
  if (typeof window === 'undefined') {
    return 'user_' + Math.random().toString(36).substring(2, 9);
  }
  const storedUid = localStorage.getItem('poker_uid');
  if (!storedUid) {
    const newUid = 'user_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('poker_uid', newUid);
    return newUid;
  }
  return storedUid;
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [userId] = useState<string>(getInitialUserId);
  const [myName, setMyName] = useState('ゲスト');

  // 入室処理（myName変更時も再実行）
  useEffect(() => {
    if (!userId) return;

    // DB上の自分の場所
    const userRef = ref(db, `rooms/${roomId}/users/${userId}`);

    // 入室書き込み
    update(userRef, {
      name: myName,
      online: true,
    });

    // ブラウザを閉じたら自動でオフラインにする予約
    onDisconnect(userRef).update({
      online: false,
    });
  }, [myName, roomId, userId]);

  // リアルタイム同期
  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, snapshot => {
      const data = snapshot.val() as Room | null;
      setRoomData(data);
    })

    return () => unsubscribe();
  }, [roomId]);

  const handleVote = (card: number | string) => {
    if (!userId) return;
    const userRef = ref(db, `rooms/${roomId}/users/${userId}`);
    update(userRef, {
      vote: card,
      online: true,
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {roomData ? 
        <>
          <h1 className="text-2xl font-bold mb-4">Room: {roomId}</h1>
      
          {/* --- 場（テーブル）エリア --- */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl mb-4 font-bold text-gray-700">参加メンバー</h2>
            <div className="flex flex-wrap gap-4">
              {Object.entries(roomData.users || {}).map(([uid, user]) => (
                <div key={uid} className={`p-4 rounded border-2 w-32 text-center ${user.vote ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <p className="font-bold truncate">{user.name}</p>
                  <div className="mt-2 text-2xl font-bold h-10 flex items-center justify-center">
                    {/* 開示済みなら数字、投票済みならチェック、未投票なら... */}
                    {roomData.status === 'revealed' 
                      ? user.vote 
                      : (user.vote ? '✅' : 'thinking...')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- 手札（投票）エリア --- */}
          <div className="fixed bottom-0 left-0 right-0 bg-white p-6 shadow-up border-t">
            <div className="max-w-4xl mx-auto">
              <p className="mb-2 text-gray-500">カードを選んでください:</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {CARDS.map((card) => (
                  <button
                    key={card}
                    onClick={() => handleVote(card)}
                    className={`
                      flex-shrink-0 w-16 h-24 rounded border-2 font-bold text-xl transition-all
                      ${userId &&roomData.users?.[userId]?.vote === card 
                        ? 'bg-blue-500 text-white border-blue-600 -translate-y-4' 
                        : 'bg-white hover:bg-gray-50 border-gray-300'}
                    `}
                  >
                    {card}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
        : 
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">ルームデータを読み込んでいます...</p>
        </div>
      }
    </div>
  );
}