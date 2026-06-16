<script setup>
import MemberList from "./MemberList.vue";
import ProjectList from "./ProjectList.vue";
import WorkspaceSwitcher from "./WorkspaceSwitcher.vue";

const navItems = [
  { to: "/board", label: "Board", count: 9 },
  { to: "/my-tasks", label: "My Tasks", count: 3 },
  { to: "/calendar", label: "Calendar" },
  { to: "/", label: "Overview" },
  { to: "/settings", label: "Settings" },
];
</script>

<template>
  <aside class="app-sidebar">
    <WorkspaceSwitcher />
    <nav class="sidebar-nav" aria-label="主要導覽">
      <RouterLink v-for="item in navItems" :key="item.to" :to="item.to">
        <span>{{ item.label }}</span>
        <span v-if="item.count" class="nav-count">{{ item.count }}</span>
      </RouterLink>
    </nav>
    <ProjectList />
    <MemberList />
  </aside>
</template>
