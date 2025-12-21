'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useSetAtom } from 'jotai';
import { userAtom, authLoadingAtom } from '@/store/auth';

// モジュールレベルの変数で初期化状態を管理
// これにより、複数のインスタンスがマウントされても1回だけ実行される
let isInitialized = false;
let unsubscribe: (() => void) | null = null;
let isLoggingIn = false;

/**
 * 認証状態を監視し、atomを更新するコンポーネント
 * アプリケーション全体で1回だけ実行されるようにするため、
 * このコンポーネントをlayout.tsxに配置する
 */
export function AuthProvider() {
  const setUser = useSetAtom(userAtom);
  const setLoading = useSetAtom(authLoadingAtom);

  useEffect(() => {
    // 既に初期化済みの場合はスキップ
    if (isInitialized) return;
    isInitialized = true;

    // ログイン状態を監視
    unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        isLoggingIn = false;
      } else if (!isLoggingIn) {
        isLoggingIn = true;
        // 未ログインなら、ここで自動的に匿名ログインさせる
        signInAnonymously(auth)
          .then(() => {
            // 成功時はonAuthStateChangedが自動的に呼ばれるが、
            // 念のためisLoggingInをリセット（onAuthStateChangedでもリセットされるが、二重にリセットしても問題ない）
            isLoggingIn = false;
          })
          .catch((error) => {
            console.error("Login Failed:", error);
            setLoading(false);
            isLoggingIn = false;
          });
      }
    });

    return () => {
      // クリーンアップ時はunsubscribeのみ実行
      // isInitializedはリセットしない（アンマウント後も認証状態は維持）
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    };
  }, [setUser, setLoading]);

  return null;
}

