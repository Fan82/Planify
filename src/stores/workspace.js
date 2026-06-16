import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "./auth";

export const useWorkspaceStore = defineStore("workspace", () => {
  // ─── State ───────────────────────────────────────────────
  const list = ref([]); // 用戶所屬的所有 workspaces
  const current = ref(null); // 當前選中的 workspace
  const loading = ref(false);
  const error = ref(null);

  // ─── Getters ─────────────────────────────────────────────
  const currentId = computed(() => current.value?.id ?? null);

  // ─── Actions ─────────────────────────────────────────────

  /**
   * 拉取用戶所有 workspaces
   * 透過 workspace_members join workspaces
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

    // 攤平結構：[{ role, workspace }] → [{ ...workspace, myRole }]
    list.value = data.map((row) => ({
      ...row.workspace,
      myRole: row.role,
    }));

    // 預設選第一個（或從 localStorage 恢復）
    const savedId = localStorage.getItem("planify:workspace-id");
    const saved = list.value.find((w) => w.id === savedId);
    current.value = saved ?? list.value[0] ?? null;
  }

  /**
   * 切換 workspace
   * @param {string} id
   */
  function switchTo(id) {
    const found = list.value.find((w) => w.id === id);
    if (!found) return;
    current.value = found;
    localStorage.setItem("planify:workspace-id", id);
    // 其他 store（tasks、members）在各自 watch currentId 後重新 fetch
  }

  /**
   * 建立新 workspace，並把自己設為 owner
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

    // 1. 建 workspace
    const { data: ws, error: wsErr } = await supabase
      .from("workspaces")
      .insert({ name, slug })
      .select()
      .single();

    if (wsErr) {
      error.value = wsErr.message;
      return { success: false };
    }

    // 2. 把自己加進 workspace_members 成 owner
    const { error: memErr } = await supabase.from("workspace_members").insert({
      workspace_id: ws.id,
      user_id: auth.user.id,
      role: "owner",
    });

    if (memErr) {
      error.value = memErr.message;
      return { success: false };
    }

    // 3. 更新本地 list，並切換到新 workspace
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
