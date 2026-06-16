<script setup>
import { computed, reactive, ref } from "vue";
import KanbanBoard from "@/components/board/KanbanBoard.vue";
import TaskDetailPanel from "@/components/task/TaskDetailPanel.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import ToastNotification from "@/components/ui/ToastNotification.vue";
import { useProjectsStore } from "@/stores/projects";
import { PRIORITIES, useTasksStore } from "@/stores/tasks";

const tasks = useTasksStore();
const projects = useProjectsStore();
const showCreate = ref(false);
const toast = ref("");
const activeFilter = ref("all");
const activeProject = computed(
  () => projects.activeProject?.name || "Q3 Product Launch",
);

const form = reactive({
  title: "",
  description: "",
  assignee: "Fan",
  dueDate: "",
  priority: "medium",
  projectId: "project-product",
  tag: "General",
});

function submitTask() {
  if (!form.title.trim()) return;
  const task = tasks.createTask(form);
  tasks.selectTask(task.id);
  Object.assign(form, {
    title: "",
    description: "",
    assignee: "Fan (You)",
    dueDate: "",
    priority: "medium",
    projectId: "project-product",
    tag: "General",
  });
  showCreate.value = false;
  toast.value = "任務已建立";
  window.setTimeout(() => {
    toast.value = "";
  }, 1800);
}
</script>

<template>
  <section class="board-page">
    <header class="topbar">
      <span class="topbar-title">{{ activeProject }}</span>
      <span class="topbar-sep">/</span>
      <div class="view-tabs">
        <button class="vtab active" type="button">Board</button>
        <button class="vtab" type="button">List</button>
        <button class="vtab" type="button">Timeline</button>
      </div>
      <div class="topbar-actions">
        <button class="tb-btn" type="button">Filter</button>
        <button class="tb-btn" type="button">Members</button>
        <BaseButton class="tb-btn primary" @click="showCreate = true">New Task</BaseButton>
      </div>
    </header>

    <div class="filter-bar">
      <button
        v-for="filter in [
          { id: 'all', label: 'All' },
          { id: 'me', label: 'Assigned to me' },
          { id: 'high', label: 'High priority' },
          { id: 'week', label: 'Due this week' },
        ]"
        :key="filter.id"
        type="button"
        class="filter-chip"
        :class="{ active: activeFilter === filter.id }"
        @click="activeFilter = filter.id"
      >
        {{ filter.label }}
      </button>
    </div>

    <div class="board-workspace">
      <KanbanBoard />
      <TaskDetailPanel />
    </div>

    <BaseModal :open="showCreate" title="New Task" @close="showCreate = false">
      <form class="task-form" @submit.prevent="submitTask">
        <BaseInput id="task-title" v-model="form.title" label="Task title" />
        <label class="field" for="task-description">
          <span>Notes</span>
          <textarea id="task-description" v-model="form.description" rows="4"></textarea>
        </label>
        <div class="form-grid">
          <BaseInput id="task-assignee" v-model="form.assignee" label="Assign to" />
          <BaseInput id="task-tag" v-model="form.tag" label="Tag" />
          <BaseInput id="task-due" v-model="form.dueDate" label="Due date" type="date" />
          <BaseSelect
            id="task-priority"
            v-model="form.priority"
            label="Priority"
            :options="PRIORITIES"
          />
          <BaseSelect
            id="task-project"
            v-model="form.projectId"
            label="Project"
            :options="projects.list"
          />
        </div>
        <div class="form-actions">
          <BaseButton variant="ghost" @click="showCreate = false">Cancel</BaseButton>
          <BaseButton type="submit">Add Task</BaseButton>
        </div>
      </form>
    </BaseModal>
    <ToastNotification :message="toast" />
  </section>
</template>
