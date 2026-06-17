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
import { PRIORITIES, TASK_STATUSES, useTasksStore } from "@/stores/tasks";

const tasks = useTasksStore();
const projects = useProjectsStore();
const showCreate = ref(false);
const toast = ref("");
const activeFilter = ref("all");
const search = ref("");

const activeProject = computed(() =>
  projects.activeProjectId === "all"
    ? "All tasks"
    : projects.activeProject?.name || "Q3 Product Launch",
);

const activeProjectDescription = computed(() =>
  projects.activeProjectId === "all"
    ? "All workspace tasks across every project."
    : projects.activeProject?.description || "Project tasks and delivery status.",
);

const visibleScopeTasks = computed(() =>
  tasks.tasks.filter(
    (task) => projects.activeProjectId === "all" || task.projectId === projects.activeProjectId,
  ),
);

const scopeStats = computed(() => {
  const scoped = visibleScopeTasks.value;
  const open = scoped.filter((task) => task.status !== "done");
  const high = scoped.filter((task) => task.priority === "high" && task.status !== "done");
  const done = scoped.filter((task) => task.status === "done");
  return [
    { label: "Tasks", value: scoped.length },
    { label: "Open", value: open.length },
    { label: "High", value: high.length },
    { label: "Done", value: done.length },
  ];
});

const projectOptions = computed(() => [
  { id: "all", name: "All tasks" },
  ...projects.list,
]);

const form = reactive({
  mode: "goal",
  title: "",
  description: "",
  assignee: "Fan (You)",
  dueDate: "",
  priority: "medium",
  status: "todo",
  projectId: "project-product",
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

function selectProject(projectId) {
  projects.selectProject(projectId);
  if (projectId === "all") {
    if (!tasks.selectedTask) tasks.selectTask(tasks.tasks[0]?.id ?? null);
    return;
  }
  if (tasks.selectedTask?.projectId === projectId) return;
  const firstProjectTask = tasks.tasks.find((task) => task.projectId === projectId);
  tasks.selectTask(firstProjectTask?.id ?? null);
}

function resetForm(mode = "goal", status = "todo") {
  Object.assign(form, {
    mode,
    title: "",
    description: "",
    assignee: "Fan (You)",
    dueDate: "",
    priority: "medium",
    status,
    projectId: projects.activeProjectId === "all" ? "project-product" : projects.activeProjectId,
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
      <span class="topbar-sep">/</span>
      <div class="view-tabs">
        <button class="vtab active" type="button">Board</button>
        <RouterLink class="vtab" to="/my-tasks">List</RouterLink>
        <RouterLink class="vtab" to="/calendar">Timeline</RouterLink>
      </div>
      <div class="topbar-actions">
        <input v-model="search" class="toolbar-search" placeholder="Search tasks" />
        <button class="tb-btn" type="button" @click="resetBoardFilters">Reset</button>
        <RouterLink class="tb-btn" to="/settings">Members</RouterLink>
        <BaseButton class="tb-btn primary" @click="openCreateGoal">Create Goal</BaseButton>
      </div>
    </header>

    <section class="project-summary" aria-label="Current board view">
      <div class="project-summary-main">
        <span class="summary-kicker">Now showing</span>
        <h1>{{ activeProject }}</h1>
        <p>{{ activeProjectDescription }}</p>
      </div>
      <div class="project-summary-controls">
        <label class="summary-select" for="board-project-select">
          <span>View</span>
          <select id="board-project-select" :value="projects.activeProjectId" @change="selectProject($event.target.value)">
            <option v-for="project in projectOptions" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </label>
        <div class="summary-stats">
          <div v-for="stat in scopeStats" :key="stat.label" class="summary-stat">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <div class="filter-bar">
      <button v-for="filter in filters" :key="filter.id" type="button" class="filter-chip"
        :class="{ active: activeFilter === filter.id }" @click="activeFilter = filter.id">
        {{ filter.label }}
      </button>
    </div>

    <div class="board-workspace">
      <KanbanBoard :filter="activeFilter" :search="search" @add-task="openCreate" />
      <TaskDetailPanel />
    </div>

    <BaseModal :open="showCreate" :title="modalTitle" @close="showCreate = false">
      <form class="task-form" @submit.prevent="submitTask">
        <div class="mode-switch" aria-label="Creation mode">
          <button
            class="mode-option"
            :class="{ active: form.mode === 'goal' }"
            type="button"
            @click="resetForm('goal')"
          >
            Goal plan
          </button>
          <button
            class="mode-option"
            :class="{ active: form.mode === 'task' }"
            type="button"
            @click="resetForm('task', form.status)"
          >
            Single task
          </button>
        </div>

        <BaseInput
          id="task-title"
          v-model="form.title"
          :label="form.mode === 'goal' ? 'Goal' : 'Task title'"
          :placeholder="form.mode === 'goal' ? 'Launch the new onboarding flow' : ''"
        />
        <label class="field" for="task-description">
          <span>{{ form.mode === 'goal' ? 'Target outcome' : 'Notes' }}</span>
          <textarea id="task-description" v-model="form.description" rows="4"></textarea>
        </label>
        <p v-if="form.mode === 'goal'" class="helper-copy">
          Planify will turn this goal into success criteria, first milestone, next action, and review tasks.
        </p>
        <div class="form-grid">
          <BaseInput id="task-assignee" v-model="form.assignee" label="Owner" />
          <BaseInput id="task-due" v-model="form.dueDate" label="Target date" type="date" />
          <BaseSelect
            v-if="form.mode === 'task'"
            id="task-status"
            v-model="form.status"
            label="Status"
            :options="TASK_STATUSES"
          />
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
