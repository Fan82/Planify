<script setup>
const labels = {
  todo: "待辦",
  doing: "進行中",
  review: "審核",
  done: "完成",
};

defineProps({
  status: { type: String, required: true },
});
</script>

<template>
  <span class="badge" :class="`status-${status}`">{{ labels[status] || status }}</span>
</template>
