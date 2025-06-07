import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "firebase/auth";

import {
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "@/firebase";

const provider = new GoogleAuthProvider();

// middleware用の単独関数
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  const initialize = async () => {
    if (initialized.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      // リダイレクト結果をチェック
      const result = await getRedirectResult(auth);
      if (result?.user) {
        user.value = result.user;
        initialized.value = true;
        return;
      }

      // 認証状態を監視
      onAuthStateChanged(auth, (newUser) => {
        user.value = newUser;
      });

      initialized.value = true;
      
    } catch (e) {
      error.value = e instanceof Error ? e.message : "認証初期化エラー";
    } finally {
      loading.value = false;
    }
  };

  const loginWithGoogle = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const isDev = window.location.hostname === "localhost";
      
      if (isDev) {
        const result = await signInWithPopup(auth, provider);
        user.value = result.user;
        loading.value = false;
      } else {
        await signInWithRedirect(auth, provider);
        // リダイレクトされるのでloadingは維持
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "認証エラー";
      loading.value = false;
      throw e;
    }
  };

  const logout = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      await signOut(auth);
      user.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "ログアウトエラー";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    error,
    initialize,
    loginWithGoogle,
    logout,
  };
});
