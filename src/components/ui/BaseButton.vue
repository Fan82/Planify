<script setup>
defineProps({
  type: { type: String, default: "button" },
  variant: { type: String, default: "primary" },
});
</script>

<template>
  <button :type="type" class="btn" :class="`btn-${variant}`">
    <slot />
  </button>
</template>
