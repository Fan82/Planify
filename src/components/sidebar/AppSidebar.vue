<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
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

const isOpen = ref(false);

function closeDrawer() {
  isOpen.value = false;
}

// Lock page scroll behind the drawer while it's open on small screens.
watch(isOpen, (open) => {
  document.body.style.overflow = open ? "hidden" : "";
});

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>

<template>
  <aside class="app-sidebar" :class="{ 'is-open': isOpen }">
    <WorkspaceSwitcher />
    <button
      class="sidebar-toggle"
      type="button"
      :aria-expanded="isOpen"
      aria-controls="sidebar-drawer"
      aria-label="Toggle navigation menu"
      @click="isOpen = !isOpen"
    >
      <span aria-hidden="true">{{ isOpen ? "✕" : "☰" }}</span>
    </button>
    <div id="sidebar-drawer" class="sidebar-drawer">
      <nav class="sidebar-nav" aria-label="Main navigation" @click="closeDrawer">
        <div class="sidebar-label">Workspace</div>
        <RouterLink v-for="item in primaryNavItems" :key="item.to" :to="item.to">
          <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
      <ProjectList />
      <MemberList />
      <nav class="sidebar-nav sidebar-utility" aria-label="Workspace tools" @click="closeDrawer">
        <RouterLink v-for="item in utilityNavItems" :key="item.to" :to="item.to">
          <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </div>
    <div v-if="isOpen" class="sidebar-backdrop" @click="closeDrawer"></div>
  </aside>
</template>
