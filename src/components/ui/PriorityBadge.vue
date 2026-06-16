<script setup>
const labels = {
  high: "高優先",
  medium: "中優先",
  low: "低優先",
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
