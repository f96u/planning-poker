// ユーザーの型
export interface User {
  name: string;
  vote: number | string | null; // 数値、'?'、または未投票(null)
  online: boolean;
  isObserver?: boolean; // オブザーバーかどうか（デフォルト: false、つまり参加者）
}

// 議論タイマーの型（ルーム全員で共有する）
export interface Timer {
  durationSec: number;    // 設定時間（秒）
  endsAt?: number | null; // 実行中の終了予定時刻（サーバー時刻基準のepoch ms）。停止中はnull
  remainingMs: number;    // 停止中の残り時間（ミリ秒）
  running: boolean;       // 実行中かどうか
}

// ルームの型
export interface Room {
  status: 'voting' | 'revealed'; // 投票中 または 開示済み
  users: Record<string, User>;   // IDをキーにしたUserオブジェクト
  createdAt: number;
  previousAverage?: number | null; // 直前ラウンドの平均（未実施時は undefined）
  timer?: Timer;                   // 議論タイマー（未使用のルームでは undefined）
}
