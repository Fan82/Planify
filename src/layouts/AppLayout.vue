<script setup>
import AppSidebar from "@/components/sidebar/AppSidebar.vue";
</script>

<template>
  <div class="app-shell">
    <AppSidebar />
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>
