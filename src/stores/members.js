import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { loadPersisted, persistRef } from "@/utils/persistence";

const AVATAR_COLORS = [
  "#FFAE00",
  "#0f6e56",
  "#993c1d",
  "#185fa5",
  "#3b6d11",
  "#854f0b",
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
    {
      userId: "james",
      name: "James L.",
      email: "james@example.com",
      role: "admin",
      state: "online",
      avatarColor: "#0f6e56",
    },
    {
      userId: "sara",
      name: "Sara R.",
      email: "sara@example.com",
      role: "member",
      state: "offline",
      avatarColor: "#993c1d",
    },
    {
      userId: "mike",
      name: "Mike K.",
      email: "mike@example.com",
      role: "member",
      state: "offline",
      avatarColor: "#185fa5",
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

  async function invite(email, role = "member") {
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
      avatarColor: avatarColor(userId),
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
    avatarColor,
    fetch,
    invite,
    updateRole,
    remove,
  };
});
