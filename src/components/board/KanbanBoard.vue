<script setup>
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import KanbanColumn from "./KanbanColumn.vue";
import { useProjectsStore } from "@/stores/projects";
import { useTasksStore, TASK_STATUSES, CURRENT_USER } from "@/stores/tasks";

const props = defineProps({
  filter: { type: String, default: "all" },
  search: { type: String, default: "" },
});

const emit = defineEmits(["add-task", "open-task"]);

const tasks = useTasksStore();
const projects = useProjectsStore();
const { activeProjectId } = storeToRefs(projects);
const draggedTaskId = ref(null);

const filteredTasks = computed(() => {
  const query = props.search.trim().toLowerCase();
  const now = new Date();
  const weekLimit = new Date(now);
  weekLimit.setDate(now.getDate() + 7);

  return tasks.tasks.filter((task) => {
    if (activeProjectId.value !== "all" && task.projectId !== activeProjectId.value) {
      return false;
    }

    if (props.filter === "me" && task.assignee !== CURRENT_USER) return false;
    if (props.filter === "high" && task.priority !== "high") return false;
    if (props.filter === "week") {
      const due = new Date(task.dueDate);
      if (task.status === "done" || due > weekLimit) return false;
    }

    if (!query) return true;
    const haystack = `${task.title} ${task.description} ${task.tag} ${task.assignee}`.toLowerCase();
    return haystack.includes(query);
  });
});

const columns = computed(() =>
  TASK_STATUSES.map((status) => ({
    ...status,
    tasks: filteredTasks.value.filter((task) => task.status === status.id),
  })),
);

function handleDrop(status) {
  if (!draggedTaskId.value) return;
  tasks.moveTask(draggedTaskId.value, status);
  draggedTaskId.value = null;
}

function handleDragStart(taskId) {
  draggedTaskId.value = taskId;
}

function handleDragEnd() {
  draggedTaskId.value = null;
}
</script>

<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="column in columns"
      :key="column.id"
      :column="column"
      :dragged-task-id="draggedTaskId"
      @open-task="emit('open-task', $event)"
      @add-task="emit('add-task', $event)"
      @drag-start="handleDragStart"
      @drag-end="handleDragEnd"
      @move-task="handleDrop"
    />
  </div>
</template>
