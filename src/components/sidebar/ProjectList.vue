<script setup>
import { storeToRefs } from "pinia";
import { useProjectsStore } from "@/stores/projects";

const projects = useProjectsStore();
const { activeProjectId, list } = storeToRefs(projects);
</script>

<template>
  <div class="sidebar-section">
    <div class="sidebar-label">Projects</div>
    <button
      class="sidebar-item"
      :class="{ active: activeProjectId === 'all' }"
      type="button"
      @click="projects.selectProject('all')"
    >
      <span class="project-dot all"></span>
      All projects
    </button>
    <button
      v-for="project in list"
      :key="project.id"
      class="sidebar-item"
      :class="{ active: activeProjectId === project.id }"
      type="button"
      @click="projects.selectProject(project.id)"
    >
      <span class="project-dot" :style="{ background: project.color }"></span>
      {{ project.name }}
    </button>
    <button class="sidebar-item muted" type="button">
      <span class="project-dot add">+</span>
      New project
    </button>
  </div>
</template>
