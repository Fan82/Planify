import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getSupabase } from "@/lib/supabase";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const isLoggedIn = computed(() => !!user.value);
  const userInitials = computed(() => {
    if (!user.value?.email) return "?";
    return user.value.email.slice(0, 2).toUpperCase();
  });

  async function login(email, password) {
    error.value = null;
    const client = getSupabase();
    if (!client) {
      error.value = "Supabase not configured";
      return { success: false };
    }
    const { data, error: err } = await client.auth.signInWithPassword({
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

  async function register(email, password, name) {
    error.value = null;
    const client = getSupabase();
    if (!client) {
      error.value = "Supabase not configured";
      return { success: false };
    }
    const { data, error: err } = await client.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (err) {
      error.value = err.message;
      return { success: false };
    }
    user.value = data.user;
    return { success: true };
  }

  async function logout() {
    const client = getSupabase();
    if (client) await client.auth.signOut();
    user.value = null;
  }

  function init() {
    const client = getSupabase();
    if (!client) {
      loading.value = false;
      console.info("Running in demo mode (no Supabase config)");
      return;
    }
    client.auth.getSession().then(({ data }) => {
      user.value = data.session?.user ?? null;
      loading.value = false;
    });
    client.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null;
      loading.value = false;
    });
  }

  return {
    user,
    loading,
    error,
    isLoggedIn,
    userInitials,
    login,
    register,
    logout,
    init,
  };
});
