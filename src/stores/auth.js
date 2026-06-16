import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";

export const useAuthStore = defineStore("auth", () => {
  // ─── State ───────────────────────────────────────────────
  const user = ref(null); // supabase auth.user
  const loading = ref(true); // true 直到 session 確認
  const error = ref(null);

  // ─── Getters ─────────────────────────────────────────────
  const isLoggedIn = computed(() => !!user.value);
  const userInitials = computed(() => {
    if (!user.value?.email) return "?";
    return user.value.email.slice(0, 2).toUpperCase();
  });

  // ─── Actions ─────────────────────────────────────────────

  /**
   * 登入
   * @param {string} email
   * @param {string} password
   */
  async function login(email, password) {
    error.value = null;
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (err) {
      error.value = err.message;
      return { success: false };
    }
    user.value = data.user;
    return { success: true };
  }

  /**
   * 註冊
   * @param {string} email
   * @param {string} password
   * @param {string} name  - 顯示名稱（存入 user_metadata）
   */
  async function register(email, password, name) {
    error.value = null;
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // 存入 auth.users.raw_user_meta_data
      },
    });
    if (err) {
      error.value = err.message;
      return { success: false };
    }
    user.value = data.user;
    return { success: true };
  }

  /**
   * 登出
   */
  async function logout() {
    await supabase.auth.signOut();
    user.value = null;
  }

  /**
   * 初始化：在 app 啟動時呼叫一次
   * 讀取現有 session，並監聽後續的 auth 狀態變化
   */
  function init() {
    // 1. 讀取現有 session
    supabase.auth.getSession().then(({ data }) => {
      user.value = data.session?.user ?? null;
      loading.value = false;
    });

    // 2. 監聽後續變化（登入、登出、token refresh）
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null;
      loading.value = false;
    });
  }

  return {
    // state
    user,
    loading,
    error,
    // getters
    isLoggedIn,
    userInitials,
    // actions
    login,
    register,
    logout,
    init,
  };
});
