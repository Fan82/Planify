<script setup>
defineProps({
  modelValue: { type: String, required: true },
  colors: { type: Array, default: () => [] },
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <fieldset class="member-color-picker">
    <legend>Avatar color</legend>
    <div class="member-color-options">
      <button
        v-for="color in colors"
        :key="color"
        class="member-color-swatch"
        :class="{ selected: modelValue === color }"
        :style="{ background: color }"
        type="button"
        :aria-label="`Use ${color} for avatar`"
        :aria-pressed="modelValue === color"
        @click="$emit('update:modelValue', color)"
      ></button>
    </div>
  </fieldset>
</template>
