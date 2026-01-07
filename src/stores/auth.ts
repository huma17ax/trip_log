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

// Standalone function for middleware
export const getCurrentUser = async (): Promise<User | null> => {
  // First, check if there's a redirect result pending
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return result.user;
    }
  } catch {
    // Ignore - no pending redirect
  }

  // Then check current auth state
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
      // Check redirect result first (may already be processed by getCurrentUser)
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          user.value = result.user;
        }
      } catch (e) {
        // Ignore - redirect result may have been consumed already
      }

      // Set up auth state listener
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
      const isDev = false; //window.location.hostname === "localhost";
      
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

  // Set user directly (used by middleware after redirect)
  const setUser = (newUser: User | null) => {
    user.value = newUser;
  };

  return {
    user,
    loading,
    error,
    initialize,
    loginWithGoogle,
    logout,
    setUser,
  };
});
