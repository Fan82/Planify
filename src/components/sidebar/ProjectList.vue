<script setup>
import { storeToRefs } from "pinia";
import { computed, reactive, ref } from "vue";
import { useProjectsStore } from "@/stores/projects";
import { useTasksStore } from "@/stores/tasks";

const projects = useProjectsStore();
const tasks = useTasksStore();
const { activeProjectId, list } = storeToRefs(projects);

const isCreating = ref(false);
const form = reactive({
  name: "",
  color: projects.projectColors[0],
});

const allTaskCount = computed(() => tasks.tasks.length);
const taskCounts = computed(() =>
  tasks.tasks.reduce((counts, task) => {
    counts[task.projectId] = (counts[task.projectId] || 0) + 1;
    return counts;
  }, {}),
);

function selectProject(projectId) {
  projects.selectProject(projectId);
  tasks.selectTask(null);
}

function startCreate() {
  form.name = "";
  form.color = projects.projectColors[list.value.length % projects.projectColors.length];
  isCreating.value = true;
}

function cancelCreate() {
  isCreating.value = false;
  form.name = "";
}

function submitProject() {
  const project = projects.createProject(form);
  if (!project) return;
  tasks.selectTask(null);
  isCreating.value = false;
  form.name = "";
}
</script>

<template>
  <div class="sidebar-section projects-section">
    <div class="sidebar-label">Projects</div>
    <button
      class="sidebar-item"
      :class="{ active: activeProjectId === 'all' }"
      type="button"
      @click="selectProject('all')"
    >
      <span class="project-dot all"></span>
      <span>All projects</span>
      <span class="nav-count">{{ allTaskCount }}</span>
    </button>
    <button
      v-for="project in list"
      :key="project.id"
      class="sidebar-item"
      :class="{ active: activeProjectId === project.id }"
      type="button"
      @click="selectProject(project.id)"
    >
      <span class="project-dot" :style="{ background: project.color }"></span>
      <span class="project-name">{{ project.name }}</span>
      <span class="nav-count">{{ taskCounts[project.id] || 0 }}</span>
    </button>

    <form v-if="isCreating" class="project-create" @submit.prevent="submitProject">
      <input v-model="form.name" aria-label="Project name" placeholder="New project name" />
      <div class="project-color-row" aria-label="Project color">
        <button
          v-for="color in projects.projectColors"
          :key="color"
          class="color-swatch"
          :class="{ selected: form.color === color }"
          :style="{ background: color }"
          type="button"
          :aria-label="`Use ${color}`"
          @click="form.color = color"
        ></button>
      </div>
      <div class="project-create-actions">
        <button class="mini-btn" type="button" @click="cancelCreate">Cancel</button>
        <button class="mini-btn primary" type="submit">Create</button>
      </div>
    </form>
    <button v-else class="sidebar-item muted" type="button" @click="startCreate">
      <span class="project-dot add">+</span>
      <span>Create project</span>
    </button>
  </div>
</template>
