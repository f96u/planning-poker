// ユーザーの型
export interface User {
  name: string;
  vote: number | string | null; // 数値、'?'、または未投票(null)
  online: boolean;
}

// ルームの型
export interface Room {
  status: 'voting' | 'revealed'; // 投票中 または 開示済み
  users: Record<string, User>;   // IDをキーにしたUserオブジェクト
  createdAt: number;
}
