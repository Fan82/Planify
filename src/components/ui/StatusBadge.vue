<script setup>
const labels = {
  todo: "Backlog",
  doing: "In Progress",
  review: "In Review",
  done: "Done",
};

defineProps({
  status: { type: String, required: true },
});
</script>

<template>
  <span class="badge" :class="`status-${status}`">{{ labels[status] || status }}</span>
</template>
