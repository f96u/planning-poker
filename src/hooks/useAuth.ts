import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // ログイン中かどうかを管理するためのref
  // Strict Modeでの二重実行対策
  const isLoggingIn = useRef(false);

  useEffect(() => {
    // ログイン状態を監視
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        isLoggingIn.current = false;
      } else if (!isLoggingIn.current) {
        isLoggingIn.current = true;
        // 未ログインなら、ここで自動的に匿名ログインさせる
        signInAnonymously(auth).catch((error) => {
          console.error("Login Failed:", error);
          setLoading(false);
          isLoggingIn.current = false;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}