<script setup>
import MemberList from "./MemberList.vue";
import ProjectList from "./ProjectList.vue";
import WorkspaceSwitcher from "./WorkspaceSwitcher.vue";

const primaryNavItems = [
  { to: "/overview", label: "Overview", icon: "◫" },
  { to: "/board", label: "Board", icon: "▦" },
  { to: "/my-tasks", label: "My tasks", icon: "✓" },
  { to: "/calendar", label: "Calendar", icon: "◷" },
];

const utilityNavItems = [
  { to: "/settings", label: "Settings", icon: "⚙" },
];
</script>

<template>
  <aside class="app-sidebar">
    <WorkspaceSwitcher />
    <nav class="sidebar-nav" aria-label="Main navigation">
      <div class="sidebar-label">Workspace</div>
      <RouterLink v-for="item in primaryNavItems" :key="item.to" :to="item.to">
        <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
    <ProjectList />
    <MemberList />
    <nav class="sidebar-nav sidebar-utility" aria-label="Workspace tools">
      <RouterLink v-for="item in utilityNavItems" :key="item.to" :to="item.to">
        <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
