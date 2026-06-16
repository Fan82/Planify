<script setup>
import MemberAvatar from "@/components/members/MemberAvatar.vue";

const members = [
  { name: "Fan (You)", state: "online" },
  { name: "James L.", state: "online" },
  { name: "Sara R.", state: "offline" },
  { name: "Mike K.", state: "offline" },
];
</script>

<template>
  <div class="sidebar-section">
    <div class="sidebar-label">Team</div>
    <div class="member-list">
      <div v-for="member in members" :key="member.name" class="member-row">
        <MemberAvatar :name="member.name" />
        <span>{{ member.name }}</span>
        <i :class="member.state"></i>
      </div>
      <div class="member-row invite-row">
        <span class="avatar add-avatar">+</span>
        <span>Invite member</span>
      </div>
    </div>
  </div>
</template>
