<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "" },
});

defineEmits(["close"]);
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <section class="modal">
      <header>
        <h2>{{ title }}</h2>
        <button type="button" class="icon-button" aria-label="Close" @click="$emit('close')">
          ×
        </button>
      </header>
      <slot />
    </section>
  </div>
</template>
