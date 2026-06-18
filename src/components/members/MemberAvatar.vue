<script setup>
import { computed } from "vue";

const props = defineProps({
  name: { type: String, required: true },
  single: { type: Boolean, default: false },
});

const initials = computed(() => {
  const parts = props.name.replace(/\([^)]*\)/g, "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (props.single) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts.length > 1 ? parts.at(-1)[0] : ""}`.toUpperCase();
});
</script>

<template>
  <span class="avatar" :title="name">
    {{ initials }}
  </span>
</template>
