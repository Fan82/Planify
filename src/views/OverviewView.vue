<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import PriorityBadge from "@/components/ui/PriorityBadge.vue";
import { TASK_STATUSES, useTasksStore } from "@/stores/tasks";
import { useProjectsStore } from "@/stores/projects";

const router = useRouter();
const tasks = useTasksStore();
const projects = useProjectsStore();

const today = new Date();
today.setHours(0, 0, 0, 0);

const riskLimit = new Date(today);
riskLimit.setDate(today.getDate() + 7);

function dueTime(task) {
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime();
}

function statusLabel(statusId) {
  return TASK_STATUSES.find((status) => status.id === statusId)?.label || statusId;
}

function projectName(projectId) {
  return projects.list.find((project) => project.id === projectId)?.name || "Workspace";
}

const activeTasks = computed(() => tasks.tasks.filter((task) => task.status !== "done"));
const reviewTasks = computed(() => tasks.tasks.filter((task) => task.status === "review"));
const inProgressTasks = computed(() => tasks.tasks.filter((task) => task.status === "doing"));

const completionRate = computed(() => {
  if (!tasks.tasks.length) return 0;
  return Math.round((tasks.completedTasks.length / tasks.tasks.length) * 100);
});

const stats = computed(() => [
  { label: "Active tasks", value: activeTasks.value.length },
  { label: "In progress", value: inProgressTasks.value.length },
  { label: "Needs review", value: reviewTasks.value.length },
  { label: "Completion", value: `${completionRate.value}%` },
]);

const attentionTasks = computed(() =>
  activeTasks.value
    .filter((task) => task.priority === "high" || task.status === "review" || dueTime(task) <= riskLimit.getTime())
    .sort((a, b) => {
      if (a.status === "review" && b.status !== "review") return -1;
      if (a.status !== "review" && b.status === "review") return 1;
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (a.priority !== "high" && b.priority === "high") return 1;
      return dueTime(a) - dueTime(b);
    })
    .slice(0, 5),
);

const projectHealth = computed(() =>
  projects.list.map((project) => {
    const projectTasks = tasks.tasks.filter((task) => task.projectId === project.id);
    const done = projectTasks.filter((task) => task.status === "done").length;
    const open = projectTasks.length - done;
    const high = projectTasks.filter((task) => task.priority === "high" && task.status !== "done").length;
    const nextTask = projectTasks
      .filter((task) => task.status !== "done")
      .sort((a, b) => dueTime(a) - dueTime(b))[0];

    return {
      ...project,
      total: projectTasks.length,
      done,
      open,
      high,
      progress: projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0,
      nextTask,
    };
  }),
);

const recentDone = computed(() => tasks.completedTasks.slice(0, 4));

function openTask(taskId) {
  tasks.selectTask(taskId);
  router.push("/board");
}
</script>

<template>
  <section class="page overview-page">
    <header class="page-header">
      <div>
        <p>Workspace</p>
        <h1>Execution Overview</h1>
      </div>
      <RouterLink class="btn btn-primary" to="/board">Create Goal</RouterLink>
    </header>

    <section class="overview-hero" aria-label="Execution health">
      <div>
        <p class="summary-kicker">Execution health</p>
        <h2>{{ activeTasks.length }} active tasks across {{ projects.list.length }} projects</h2>
      </div>
      <div class="overview-hero-score">
        <span>Completion</span>
        <strong>{{ completionRate }}%</strong>
      </div>
    </section>

    <div class="stats-grid">
      <article v-for="stat in stats" :key="stat.label" class="stat-card">
        <span>{{ stat.label }}</span>
        <strong>{{ stat.value }}</strong>
      </article>
    </div>

    <div class="overview-grid">
      <section class="panel attention-panel">
        <header class="panel-header">
          <h2>Needs attention</h2>
          <span>{{ attentionTasks.length }} items</span>
        </header>
        <div v-if="attentionTasks.length" class="overview-task-list">
          <article v-for="task in attentionTasks" :key="task.id" class="overview-task">
            <button type="button" @click="openTask(task.id)">
              <strong>{{ task.title }}</strong>
              <span>{{ projectName(task.projectId) }} - {{ statusLabel(task.status) }} - Due {{ task.dueDate }}</span>
            </button>
            <PriorityBadge :priority="task.priority" />
          </article>
        </div>
        <p v-else class="focus-empty">No urgent work right now.</p>
      </section>

      <section class="panel project-health-panel">
        <header class="panel-header">
          <h2>Project health</h2>
          <span>{{ projects.list.length }} projects</span>
        </header>
        <div class="project-health-list">
          <article v-for="project in projectHealth" :key="project.id" class="project-health-row">
            <div class="project-health-head">
              <div>
                <strong>{{ project.name }}</strong>
                <span>{{ project.open }} open / {{ project.total }} total</span>
              </div>
              <b>{{ project.progress }}%</b>
            </div>
            <div class="progress-track" aria-hidden="true">
              <span :style="{ width: `${project.progress}%`, background: project.color }"></span>
            </div>
            <button v-if="project.nextTask" type="button" class="project-next" @click="openTask(project.nextTask.id)">
              Next: {{ project.nextTask.title }}
            </button>
            <p v-else class="project-next muted">No open tasks</p>
          </article>
        </div>
      </section>
    </div>

    <section class="panel completed-panel">
      <header class="panel-header">
        <h2>Recently completed</h2>
        <span>{{ recentDone.length }} items</span>
      </header>
      <div v-if="recentDone.length" class="compact-list">
        <button v-for="task in recentDone" :key="task.id" type="button" @click="openTask(task.id)">
          <strong>{{ task.title }}</strong>
          <span>{{ projectName(task.projectId) }}</span>
        </button>
      </div>
      <p v-else class="focus-empty">Completed tasks will appear here.</p>
    </section>
  </section>
</template>
