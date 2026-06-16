<script setup>
import RoleBadge from "@/components/members/RoleBadge.vue";

const members = [
  { name: "Fan", email: "fan@example.com", role: "owner" },
  { name: "Alex", email: "alex@example.com", role: "admin" },
  { name: "Mina", email: "mina@example.com", role: "member" },
  { name: "Chris", email: "chris@example.com", role: "member" },
];
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p>Workspace</p>
        <h1>團隊設定</h1>
      </div>
    </header>
    <section class="panel">
      <header class="panel-header">
        <h2>成員與權限</h2>
        <span>Supabase 接上後會改成真實資料</span>
      </header>
      <div class="member-table">
        <div v-for="member in members" :key="member.email">
          <strong>{{ member.name }}</strong>
          <span>{{ member.email }}</span>
          <RoleBadge :role="member.role" />
        </div>
      </div>
    </section>
  </section>
</template>
