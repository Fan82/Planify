<script setup>
import { useMembersStore } from "@/stores/members";

const members = useMembersStore();
</script>

<template>
  <div class="workspace-switcher">
    <div class="ws-badge">P</div>
    <div>
      <strong>Fan's <br />Workspace</strong>
      <span>{{ members.list.length }} member{{ members.list.length === 1 ? "" : "s" }}</span>
    </div>
  </div>
</template>
