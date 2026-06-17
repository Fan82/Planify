import { getSupabase } from "@/lib/supabase";
import { watch } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "@/layouts/AppLayout.vue";
import BoardView from "@/views/BoardView.vue";
import CalendarView from "@/views/CalendarView.vue";
import MyTasksView from "@/views/MyTasksView.vue";
import OverviewView from "@/views/OverviewView.vue";
import SettingsView from "@/views/SettingsView.vue";
import LoginView from "@/views/auth/LoginView.vue";
import RegisterView from "@/views/auth/RegisterView.vue";

const routes = [
  // Authenticated app routes
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: { name: "board" } },
      { path: "overview", name: "overview", component: OverviewView },
      { path: "board", name: "board", component: BoardView },
      { path: "my-tasks", name: "my-tasks", component: MyTasksView },
      { path: "calendar", name: "calendar", component: CalendarView },
      { path: "settings", name: "settings", component: SettingsView },
    ],
  },
  // Guest routes
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
    meta: { requiresGuest: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach(async (to) => {
  // No Supabase config means demo mode, so allow all routes.
  if (!getSupabase()) return true;
  // Dynamic import avoids a circular dependency.
  const { useAuthStore } = await import("@/stores/auth");
  const auth = useAuthStore();

  // Wait until the auth session check finishes.
  if (auth.loading) {
    await new Promise((resolve) => {
      const stop = watch(
        () => auth.loading,
        (val) => {
          if (!val) {
            stop();
            resolve();
          }
        },
      );
    });
  }

  const isLoggedIn = auth.isLoggedIn;

  // Send unauthenticated users to login for protected pages.
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: "login" };
  }

  // Send authenticated users back to the app from guest pages.
  if (to.meta.requiresGuest && isLoggedIn) {
    return { name: "board" };
  }
});

export default router;
