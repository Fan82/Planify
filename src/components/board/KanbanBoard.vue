<script setup>
import { storeToRefs } from "pinia";
import { computed } from "vue";
import KanbanColumn from "./KanbanColumn.vue";
import { useProjectsStore } from "@/stores/projects";
import { useTasksStore, TASK_STATUSES } from "@/stores/tasks";

const tasks = useTasksStore();
const projects = useProjectsStore();
const { activeProjectId } = storeToRefs(projects);

const columns = computed(() =>
  TASK_STATUSES.map((status) => ({
    ...status,
    tasks: tasks.tasks.filter(
      (task) =>
        task.status === status.id &&
        (activeProjectId.value === "all" || task.projectId === activeProjectId.value),
    ),
  })),
);
</script>

<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="column in columns"
      :key="column.id"
      :column="column"
      @open-task="tasks.selectTask"
    />
  </div>
</template>
