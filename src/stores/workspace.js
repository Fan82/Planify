import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "./auth";

export const useWorkspaceStore = defineStore("workspace", () => {
  // ─── State ───────────────────────────────────────────────
  const list = ref([]); // Workspaces the current user belongs to
  const current = ref(null); // Currently selected workspace
  const loading = ref(false);
  const error = ref(null);

  // ─── Getters ─────────────────────────────────────────────
  const currentId = computed(() => current.value?.id ?? null);

  // ─── Actions ─────────────────────────────────────────────

  /**
   * Fetch all workspaces for the current user
   * Join workspace_members with workspaces
   */
  async function fetchAll() {
    const auth = useAuthStore();
    if (!auth.user) return;

    loading.value = true;
    error.value = null;

    const { data, error: err } = await supabase
      .from("workspace_members")
      .select(
        `
        role,
        workspace:workspaces (
          id,
          name,
          slug,
          plan
        )
      `,
      )
      .eq("user_id", auth.user.id);

    loading.value = false;

    if (err) {
      error.value = err.message;
      return;
    }

    // Flatten rows into workspace objects with myRole.
    list.value = data.map((row) => ({
      ...row.workspace,
      myRole: row.role,
    }));

    // Default to the saved workspace or the first item.
    const savedId = localStorage.getItem("planify:workspace-id");
    const saved = list.value.find((w) => w.id === savedId);
    current.value = saved ?? list.value[0] ?? null;
  }

  /**
   * Switch workspace
   * @param {string} id
   */
  function switchTo(id) {
    const found = list.value.find((w) => w.id === id);
    if (!found) return;
    current.value = found;
    localStorage.setItem("planify:workspace-id", id);
    // Other stores can refetch after watching currentId.
  }

  /**
   * Create a workspace and add the current user as owner
   * @param {string} name
   */
  async function createWorkspace(name) {
    const auth = useAuthStore();
    if (!auth.user) return { success: false };

    error.value = null;

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // 1. Create workspace
    const { data: ws, error: wsErr } = await supabase
      .from("workspaces")
      .insert({ name, slug })
      .select()
      .single();

    if (wsErr) {
      error.value = wsErr.message;
      return { success: false };
    }

    // 2. Add self as workspace owner
    const { error: memErr } = await supabase.from("workspace_members").insert({
      workspace_id: ws.id,
      user_id: auth.user.id,
      role: "owner",
    });

    if (memErr) {
      error.value = memErr.message;
      return { success: false };
    }

    // 3. Update local list and switch to the new workspace
    const newWorkspace = { ...ws, myRole: "owner" };
    list.value.push(newWorkspace);
    switchTo(ws.id);

    return { success: true, workspace: newWorkspace };
  }

  return {
    // state
    list,
    current,
    loading,
    error,
    // getters
    currentId,
    // actions
    fetchAll,
    switchTo,
    createWorkspace,
  };
});
