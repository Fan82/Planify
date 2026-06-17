<script setup>
import { useMembersStore } from "@/stores/members";
import MemberAvatar from "@/components/members/MemberAvatar.vue";

const members = useMembersStore();
</script>

<template>
  <div class="sidebar-section">
    <div class="sidebar-label">Team</div>
    <div class="member-list">
      <div v-for="member in members.list" :key="member.userId" class="member-row">
        <MemberAvatar :name="member.name" />
        <span>{{ member.name }}</span>
        <i :class="member.state"></i>
      </div>
      <RouterLink class="member-row invite-row" to="/settings">
        <span class="avatar add-avatar">+</span>
        <span>Invite member</span>
      </RouterLink>
    </div>
  </div>
</template>
