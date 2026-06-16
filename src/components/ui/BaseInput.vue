<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: [String, Number], default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <label class="field" :for="id">
    <span>{{ label }}</span>
    <input :id="id" :type="type" :value="modelValue" :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)" />
  </label>
</template>
