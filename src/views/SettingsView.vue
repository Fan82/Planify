<script setup>
import { reactive, ref } from "vue";
import MemberAvatar from "@/components/members/MemberAvatar.vue";
import RoleBadge from "@/components/members/RoleBadge.vue";
import ToastNotification from "@/components/ui/ToastNotification.vue";
import { useMembersStore } from "@/stores/members";

const members = useMembersStore();
const toast = ref("");
const inviteForm = reactive({
  email: "",
  role: "member",
});

function notify(message) {
  toast.value = message;
  window.setTimeout(() => {
    toast.value = "";
  }, 1800);
}

async function inviteMember() {
  const result = await members.invite(inviteForm.email, inviteForm.role);
  if (!result.success) {
    notify(members.error || "Unable to invite member");
    return;
  }
  inviteForm.email = "";
  inviteForm.role = "member";
  notify("Member invited");
}

async function updateRole(member, role) {
  const result = await members.updateRole(member.userId, role);
  if (result.success) notify("Role updated");
}

async function removeMember(member) {
  const result = await members.remove(member.userId);
  if (result.success) notify("Member removed");
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p>Workspace</p>
        <h1>Team Settings</h1>
      </div>
    </header>

    <div class="settings-grid">
      <section class="panel">
        <header class="panel-header">
          <h2>Invite member</h2>
          <span>{{ members.list.length }} members</span>
        </header>
        <form class="settings-form" @submit.prevent="inviteMember">
          <label class="field" for="invite-email">
            <span>Email</span>
            <input id="invite-email" v-model="inviteForm.email" type="email" placeholder="teammate@example.com" />
          </label>
          <label class="field" for="invite-role">
            <span>Role</span>
            <select id="invite-role" v-model="inviteForm.role">
              <option value="admin">admin</option>
              <option value="member">member</option>
            </select>
          </label>
          <button class="btn btn-primary" type="submit">Invite</button>
        </form>
      </section>

      <section class="panel">
        <header class="panel-header">
          <h2>Members & permissions</h2>
          <span>{{ members.admins.length }} admins</span>
        </header>
        <div class="member-table interactive">
          <div v-for="member in members.list" :key="member.userId">
            <span class="member-cell">
              <MemberAvatar :name="member.name" />
              <strong>{{ member.name }}</strong>
            </span>
            <span>{{ member.email }}</span>
            <RoleBadge :role="member.role" />
            <div class="member-actions">
              <select
                :value="member.role"
                :disabled="member.role === 'owner'"
                @change="updateRole(member, $event.target.value)"
              >
                <option value="owner">owner</option>
                <option value="admin">admin</option>
                <option value="member">member</option>
              </select>
              <button
                class="mini-btn danger"
                type="button"
                :disabled="member.role === 'owner'"
                @click="removeMember(member)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
    <ToastNotification :message="toast" />
  </section>
</template>
