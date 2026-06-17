<script setup>
const labels = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

defineProps({
  priority: { type: String, required: true },
});
</script>

<template>
  <span class="badge" :class="`priority-${priority}`">
    {{ labels[priority] || priority }}
  </span>
</template>
