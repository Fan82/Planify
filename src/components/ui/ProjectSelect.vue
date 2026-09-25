<script setup>
import { nextTick, ref } from "vue";
import { useProjectsStore } from "@/stores/projects";

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: "Project" },
  modelValue: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const projects = useProjectsStore();
const isCreating = ref(false);
const newName = ref("");
const nameInput = ref(null);

function startCreate() {
  newName.value = "";
  isCreating.value = true;
  nextTick(() => nameInput.value?.focus());
}

function cancelCreate() {
  isCreating.value = false;
  newName.value = "";
}

function confirmCreate() {
  const project = projects.createProject({ name: newName.value });
  if (!project) return;
  emit("update:modelValue", project.id);
  isCreating.value = false;
  newName.value = "";
}
</script>

<template>
  <div class="field project-field">
    <div class="field-label-row">
      <span>{{ label }}</span>
      <button
        class="icon-add-btn"
        type="button"
        aria-label="Create new project"
        title="Create new project"
        @click="startCreate"
      >
        +
      </button>
    </div>
    <select
      v-if="!isCreating"
      :id="id"
      :aria-label="label"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="project in projects.list" :key="project.id" :value="project.id">
        {{ project.name }}
      </option>
    </select>
    <div v-else class="project-inline-create">
      <input
        :id="id"
        ref="nameInput"
        v-model="newName"
        :aria-label="'New ' + label.toLowerCase() + ' name'"
        placeholder="New project name"
        @keyup.enter="confirmCreate"
        @keyup.esc="cancelCreate"
      />
      <button class="mini-btn" type="button" @click="cancelCreate">Cancel</button>
      <button class="mini-btn primary" type="button" @click="confirmCreate">Add</button>
    </div>
  </div>
</template>
