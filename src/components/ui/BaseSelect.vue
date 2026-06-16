<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, default: "" },
  options: { type: Array, default: () => [] },
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <label class="field" :for="id">
    <span>{{ label }}</span>
    <select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option
        v-for="option in options"
        :key="option.id || option.value"
        :value="option.id || option.value"
      >
        {{ option.label || option.name }}
      </option>
    </select>
  </label>
</template>
