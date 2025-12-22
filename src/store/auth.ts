import { atom } from 'jotai';
import { User } from 'firebase/auth';

// 認証状態を管理するatom
export const userAtom = atom<User | null>(null);
export const authLoadingAtom = atom<boolean>(true);

