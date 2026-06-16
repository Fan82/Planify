import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabase";
import { useWorkspaceStore } from "./workspace";

export const useMembersStore = defineStore("members", () => {
  // ─── State ───────────────────────────────────────────────
  const list = ref([]); // [{ user_id, name, email, role, avatarColor }]
  const loading = ref(false);
  const error = ref(null);

  // 用 user_id 的字元計算一個固定顏色，視覺上好辨認
  const AVATAR_COLORS = [
    "#534ab7",
    "#0f6e56",
    "#993c1d",
    "#185fa5",
    "#3b6d11",
    "#854f0b",
  ];
  function avatarColor(userId) {
    const n = userId.charCodeAt(0) + userId.charCodeAt(userId.length - 1);
    return AVATAR_COLORS[n % AVATAR_COLORS.length];
  }

  // ─── Actions ─────────────────────────────────────────────

  /**
   * 拉取當前 workspace 的所有成員
   */
  async function fetch() {
    const ws = useWorkspaceStore();
    if (!ws.currentId) return;

    loading.value = true;
    error.value = null;

    const { data, error: err } = await supabase
      .from("workspace_members")
      .select(
        `
        user_id,
        role,
        joined_at,
        user:user_id (
          id,
          email,
          raw_user_meta_data
        )
      `,
      )
      .eq("workspace_id", ws.currentId);

    loading.value = false;

    if (err) {
      error.value = err.message;
      return;
    }

    list.value = data.map((row) => ({
      userId: row.user_id,
      role: row.role,
      joinedAt: row.joined_at,
      email: row.user?.email ?? "",
      name: row.user?.raw_user_meta_data?.name ?? row.user?.email ?? "",
      avatarColor: avatarColor(row.user_id),
    }));
  }

  /**
   * 發送邀請（寫入 invitations 表）
   * 實際寄信需要配合 Supabase Edge Function
   * @param {string} email
   * @param {string} role  'admin' | 'member'
   */
  async function invite(email, role = "member") {
    const ws = useWorkspaceStore();
    error.value = null;

    // 檢查是否已是成員
    const exists = list.value.find((m) => m.email === email);
    if (exists) {
      error.value = "This email is already a member of this workspace.";
      return { success: false };
    }

    const token = crypto.randomUUID();

    const { error: err } = await supabase.from("invitations").insert({
      workspace_id: ws.currentId,
      email,
      role,
      token,
    });

    if (err) {
      error.value = err.message;
      return { success: false };
    }

    // TODO: 呼叫 Edge Function 發送邀請信
    // await supabase.functions.invoke('send-invite-email', {
    //   body: { email, token, workspaceName: ws.current.name }
    // })

    return { success: true };
  }

  /**
   * 更改成員 role（需 admin 或 owner 權限，UI 層控制）
   * @param {string} userId
   * @param {string} newRole  'admin' | 'member'
   */
  async function updateRole(userId, newRole) {
    const ws = useWorkspaceStore();
    error.value = null;

    const { error: err } = await supabase
      .from("workspace_members")
      .update({ role: newRole })
      .eq("workspace_id", ws.currentId)
      .eq("user_id", userId);

    if (err) {
      error.value = err.message;
      return { success: false };
    }

    // 更新本地 list
    const member = list.value.find((m) => m.userId === userId);
    if (member) member.role = newRole;

    return { success: true };
  }

  /**
   * 移除成員（需 admin 或 owner 權限）
   * @param {string} userId
   */
  async function remove(userId) {
    const ws = useWorkspaceStore();
    error.value = null;

    const { error: err } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", ws.currentId)
      .eq("user_id", userId);

    if (err) {
      error.value = err.message;
      return { success: false };
    }

    list.value = list.value.filter((m) => m.userId !== userId);
    return { success: true };
  }

  return {
    list,
    loading,
    error,
    avatarColor,
    fetch,
    invite,
    updateRole,
    remove,
  };
});
