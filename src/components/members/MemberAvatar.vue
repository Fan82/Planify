<script setup>
defineProps({
  name: { type: String, required: true },
});
</script>

<template>
  <span class="avatar" :title="name">
    {{ name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() }}
  </span>
</template>
