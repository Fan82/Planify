import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { loadPersisted, persistRef } from "@/utils/persistence";

const AVATAR_COLORS = [
  "#6f68d9",
  "#1d9e75",
  "#d65d7a",
  "#3b82f6",
  "#ef9f27",
  "#8b5cf6",
];

export const useMembersStore = defineStore("members", () => {
  const defaultMembers = [
    {
      userId: "fan",
      name: "Fan (You)",
      email: "fan@example.com",
      role: "owner",
      state: "online",
      avatarColor: "#534ab7",
    },
  ];

  const list = ref(loadPersisted("planify:members", defaultMembers));
  persistRef("planify:members", list);

  const loading = ref(false);
  const error = ref(null);

  const admins = computed(() =>
    list.value.filter((member) => ["owner", "admin"].includes(member.role)),
  );

  function avatarColor(userId) {
    const n = userId.charCodeAt(0) + userId.charCodeAt(userId.length - 1);
    return AVATAR_COLORS[n % AVATAR_COLORS.length];
  }

  async function fetch() {
    return list.value;
  }

  async function invite(email, role = "member", color = "") {
    error.value = null;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      error.value = "Email is required.";
      return { success: false };
    }
    if (
      list.value.some(
        (member) => member.email.toLowerCase() === normalizedEmail,
      )
    ) {
      error.value = "This email is already a member of this workspace.";
      return { success: false };
    }
    const userId =
      normalizedEmail.split("@")[0].replace(/[^a-z0-9]/gi, "-") ||
      crypto.randomUUID();
    const member = {
      userId,
      name: normalizedEmail
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      email: normalizedEmail,
      role,
      state: "offline",
      avatarColor: AVATAR_COLORS.includes(color) ? color : avatarColor(userId),
    };
    list.value.push(member);
    return { success: true, member };
  }

  async function updateRole(userId, newRole) {
    error.value = null;
    const member = list.value.find((item) => item.userId === userId);
    if (!member || member.role === "owner") return { success: false };
    member.role = newRole;
    return { success: true };
  }

  async function remove(userId) {
    error.value = null;
    const member = list.value.find((item) => item.userId === userId);
    if (!member || member.role === "owner") return { success: false };
    list.value = list.value.filter((item) => item.userId !== userId);
    return { success: true };
  }

  return {
    list,
    admins,
    loading,
    error,
    avatarColors: AVATAR_COLORS,
    avatarColor,
    fetch,
    invite,
    updateRole,
    remove,
  };
});
