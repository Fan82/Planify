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
import { CURRENT_USER, PRIORITIES, TASK_STATUSES, useTasksStore } from "@/stores/tasks";

const tasks = useTasksStore();
const projects = useProjectsStore();
const showCreate = ref(false);
const toast = ref("");
const activeFilter = ref("all");
const search = ref("");

const activeProject = computed(() =>
  projects.activeProjectId === "all"
    ? "All tasks"
    : projects.activeProject?.name || "Untitled Project",
);

const visibleScopeTasks = computed(() =>
  tasks.tasks.filter(
    (task) => projects.activeProjectId === "all" || task.projectId === projects.activeProjectId,
  ),
);

const ownerCount = computed(() =>
  new Set(visibleScopeTasks.value.map((task) => task.assignee).filter(Boolean)).size,
);

const form = reactive({
  mode: "goal",
  title: "",
  description: "",
  assignee: CURRENT_USER,
  dueDate: "",
  priority: "medium",
  status: "todo",
  projectId: "",
  tag: "General",
});

const modalTitle = computed(() => (form.mode === "goal" ? "Create Goal" : "New Task"));
const submitLabel = computed(() => (form.mode === "goal" ? "Create plan" : "Add Task"));

const filters = [
  { id: "all", label: "All" },
  { id: "me", label: "Mine" },
  { id: "high", label: "High priority" },
  { id: "week", label: "Due this week" },
];

function notify(message) {
  toast.value = message;
  window.setTimeout(() => {
    toast.value = "";
  }, 1800);
}

function resetForm(mode = "goal", status = "todo") {
  Object.assign(form, {
    mode,
    title: "",
    description: "",
    assignee: CURRENT_USER,
    dueDate: "",
    priority: "medium",
    status,
    projectId: projects.activeProjectId === "all" ? (projects.list[0]?.id ?? "") : projects.activeProjectId,
    tag: mode === "goal" ? "Goal" : "General",
  });
}

function openCreateGoal() {
  resetForm("goal");
  showCreate.value = true;
}

function openCreate(status = "todo") {
  resetForm("task", status);
  showCreate.value = true;
}

function submitTask() {
  if (!form.title.trim()) return;

  if (form.mode === "goal") {
    const created = tasks.createGoalPlan(form);
    if (!created.length) return;
    showCreate.value = false;
    notify("Goal plan created");
    return;
  }

  const task = tasks.createTask(form);
  tasks.selectTask(task.id);
  showCreate.value = false;
  notify("Task created");
}

function resetBoardFilters() {
  activeFilter.value = "all";
  search.value = "";
}
</script>

<template>
  <section class="board-page">
    <header class="topbar">
      <span class="topbar-title">{{ activeProject }}</span>
      <div class="view-tabs">
        <button class="vtab active" type="button">Board</button>
        <RouterLink class="vtab" to="/my-tasks">List</RouterLink>
        <RouterLink class="vtab" to="/calendar">Timeline</RouterLink>
      </div>
      <div class="topbar-actions">
        <details class="board-tools-menu">
          <summary class="topbar-icon" aria-label="Board tools" title="Board tools">•••</summary>
          <div class="board-tools-popover">
            <label class="board-search-field" for="board-search">
              <span>Search</span>
              <input id="board-search" v-model="search" class="toolbar-search" placeholder="Search tasks" />
            </label>
            <div class="board-filter-options" aria-label="Task filters">
              <button v-for="filter in filters" :key="filter.id" type="button" class="filter-chip"
                :class="{ active: activeFilter === filter.id }" @click="activeFilter = filter.id">
                {{ filter.label }}
              </button>
            </div>
            <div class="board-tools-actions">
              <button class="mini-btn" type="button" @click="resetBoardFilters">Reset</button>
              <RouterLink class="mini-btn" to="/settings">Members</RouterLink>
            </div>
          </div>
        </details>
        <BaseButton class="tb-btn primary create-goal-btn" @click="openCreateGoal">Create Goal</BaseButton>
      </div>
    </header>

    <section class="board-intro" aria-label="Current board view">
      <p class="board-kicker"><span>02</span><b>·</b> KEEP WORK MOVING</p>
      <div class="board-heading-row">
        <h1>{{ activeProject }}</h1>
        <p>{{ visibleScopeTasks.length }} TASKS <span>·</span> {{ ownerCount }} OWNERS</p>
      </div>
    </section>

    <div class="board-workspace">
      <KanbanBoard :filter="activeFilter" :search="search" @add-task="openCreate" @open-task="tasks.selectTask" />
      <TaskDetailPanel v-if="tasks.selectedTask" />
    </div>

    <BaseModal :open="showCreate" :title="modalTitle" @close="showCreate = false">
      <form class="task-form" @submit.prevent="submitTask">
        <div class="mode-switch" aria-label="Creation mode">
          <button class="mode-option" :class="{ active: form.mode === 'goal' }" type="button"
            @click="resetForm('goal')">
            Goal plan
          </button>
          <button class="mode-option" :class="{ active: form.mode === 'task' }" type="button"
            @click="resetForm('task', form.status)">
            Single task
          </button>
        </div>

        <BaseInput id="task-title" v-model="form.title" :label="form.mode === 'goal' ? 'Goal' : 'Task title'"
          :placeholder="form.mode === 'goal' ? 'Launch the new onboarding flow' : ''" />
        <p v-if="form.mode === 'goal'" class="helper-copy">
          Planify will turn this goal into success criteria, first milestone, next action, and review tasks.
        </p>
        <label class="field" for="task-description">
          <span>{{ form.mode === 'goal' ? 'Target outcome' : 'Notes' }}</span>
          <textarea id="task-description" v-model="form.description" rows="4"></textarea>
        </label>
        <div class="form-grid">
          <BaseInput id="task-assignee" v-model="form.assignee" label="Owner" />
          <BaseInput id="task-due" v-model="form.dueDate" label="Target date" type="text" placeholder="YYYY-MM-DD" />
          <BaseSelect v-if="form.mode === 'task'" id="task-status" v-model="form.status" label="Status"
            :options="TASK_STATUSES" />
          <BaseInput v-if="form.mode === 'task'" id="task-tag" v-model="form.tag" label="Tag" />
          <BaseSelect id="task-priority" v-model="form.priority" label="Priority" :options="PRIORITIES" />
          <BaseSelect id="task-project" v-model="form.projectId" label="Project" :options="projects.list" />
        </div>
        <div class="form-actions">
          <BaseButton variant="ghost" @click="showCreate = false">Cancel</BaseButton>
          <BaseButton type="submit">{{ submitLabel }}</BaseButton>
        </div>
      </form>
    </BaseModal>
    <ToastNotification :message="toast" />
  </section>
</template>
