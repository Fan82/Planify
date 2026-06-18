<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import PriorityBadge from "@/components/ui/PriorityBadge.vue";
import { CURRENT_USER, TASK_STATUSES, useTasksStore } from "@/stores/tasks";
import { useProjectsStore } from "@/stores/projects";

const router = useRouter();
const tasks = useTasksStore();
const projects = useProjectsStore();

const today = new Date();
today.setHours(0, 0, 0, 0);

const priorityScore = { high: 0, medium: 1, low: 2 };
const statusScore = { doing: 0, review: 1, todo: 2, done: 3 };

function dueTime(task) {
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime();
}

function isDueToday(task) {
  return dueTime(task) <= today.getTime();
}

function isUpcoming(task) {
  return dueTime(task) > today.getTime();
}

function projectName(projectId) {
  return projects.list.find((project) => project.id === projectId)?.name || "Workspace";
}

function statusLabel(statusId) {
  return TASK_STATUSES.find((status) => status.id === statusId)?.label || statusId;
}

const mine = computed(() => tasks.tasks.filter((task) => task.assignee === CURRENT_USER));
const openMine = computed(() => mine.value.filter((task) => task.status !== "done"));

const sortedOpenMine = computed(() =>
  [...openMine.value].sort((a, b) => {
    const statusDiff = (statusScore[a.status] ?? 9) - (statusScore[b.status] ?? 9);
    if (statusDiff) return statusDiff;

    const priorityDiff = (priorityScore[a.priority] ?? 9) - (priorityScore[b.priority] ?? 9);
    if (priorityDiff) return priorityDiff;

    return dueTime(a) - dueTime(b);
  }),
);

const recommendedTask = computed(() => sortedOpenMine.value[0] || null);

const todayTasks = computed(() =>
  sortedOpenMine.value.filter((task) => task.id !== recommendedTask.value?.id && isDueToday(task)),
);

const upcomingTasks = computed(() =>
  sortedOpenMine.value.filter(
    (task) => task.id !== recommendedTask.value?.id && !isDueToday(task) && isUpcoming(task),
  ),
);

const reviewTasks = computed(() =>
  mine.value.filter((task) => task.status === "review" && task.id !== recommendedTask.value?.id),
);

const doneTasks = computed(() => mine.value.filter((task) => task.status === "done"));

const focusStats = computed(() => [
  { label: "Open", value: openMine.value.length },
  { label: "Due today", value: openMine.value.filter(isDueToday).length },
  { label: "High priority", value: openMine.value.filter((task) => task.priority === "high").length },
  { label: "Done", value: doneTasks.value.length },
]);

function openTask(taskId) {
  tasks.selectTask(taskId);
  router.push("/board");
}

function startTask(taskId) {
  tasks.moveTask(taskId, "doing");
}

function completeTask(taskId) {
  tasks.moveTask(taskId, "done");
}
</script>

<template>
  <section class="page focus-page">
    <header class="page-header focus-header">
      <div>
        <p>Today</p>
        <h1>Focus Plan</h1>
      </div>
      <RouterLink class="btn btn-secondary" to="/calendar">Calendar</RouterLink>
    </header>

    <section class="focus-hero" aria-label="Recommended next task">
      <div class="focus-copy">
        <p class="summary-kicker">Recommended next task</p>
        <template v-if="recommendedTask">
          <h2>{{ recommendedTask.title }}</h2>
          <p>{{ recommendedTask.description }}</p>
          <div class="focus-meta-row">
            <PriorityBadge :priority="recommendedTask.priority" />
            <span>{{ statusLabel(recommendedTask.status) }}</span>
            <span>{{ projectName(recommendedTask.projectId) }}</span>
            <time :datetime="recommendedTask.dueDate">Due {{ recommendedTask.dueDate }}</time>
          </div>
        </template>
        <template v-else>
          <h2>No open personal tasks</h2>
          <p>Create a goal from the board and Planify will turn it into clear execution steps.</p>
        </template>
      </div>
      <div class="focus-actions" v-if="recommendedTask">
        <button class="btn btn-primary" type="button" @click="startTask(recommendedTask.id)">Start</button>
        <button class="btn btn-secondary" type="button" @click="completeTask(recommendedTask.id)">Done</button>
        <button class="btn btn-ghost" type="button" @click="openTask(recommendedTask.id)">Open on board</button>
      </div>
      <RouterLink v-else class="btn btn-primary create-goal-btn" to="/board">Create Goal</RouterLink>
    </section>

    <div class="focus-stats" aria-label="Today focus summary">
      <article v-for="stat in focusStats" :key="stat.label">
        <span>{{ stat.label }}</span>
        <strong>{{ stat.value }}</strong>
      </article>
    </div>

    <div class="focus-grid">
      <section class="focus-lane">
        <header>
          <h2>Due today</h2>
          <span>{{ todayTasks.length }} items</span>
        </header>
        <div class="focus-list" v-if="todayTasks.length">
          <article v-for="task in todayTasks" :key="task.id" class="focus-task">
            <button type="button" @click="openTask(task.id)">
              <strong>{{ task.title }}</strong>
              <span>{{ projectName(task.projectId) }} - {{ statusLabel(task.status) }}</span>
            </button>
            <div class="focus-task-actions">
              <button type="button" @click="startTask(task.id)">Start</button>
              <button type="button" @click="completeTask(task.id)">Done</button>
            </div>
          </article>
        </div>
        <p v-else class="focus-empty">No personal tasks due today.</p>
      </section>

      <section class="focus-lane">
        <header>
          <h2>Upcoming</h2>
          <span>{{ upcomingTasks.length }} items</span>
        </header>
        <div class="focus-list" v-if="upcomingTasks.length">
          <article v-for="task in upcomingTasks" :key="task.id" class="focus-task">
            <button type="button" @click="openTask(task.id)">
              <strong>{{ task.title }}</strong>
              <span>{{ projectName(task.projectId) }} - Due {{ task.dueDate }}</span>
            </button>
            <PriorityBadge :priority="task.priority" />
          </article>
        </div>
        <p v-else class="focus-empty">No upcoming personal tasks.</p>
      </section>

      <section class="focus-lane">
        <header>
          <h2>Ready to review</h2>
          <span>{{ reviewTasks.length }} items</span>
        </header>
        <div class="focus-list" v-if="reviewTasks.length">
          <article v-for="task in reviewTasks" :key="task.id" class="focus-task">
            <button type="button" @click="openTask(task.id)">
              <strong>{{ task.title }}</strong>
              <span>{{ projectName(task.projectId) }}</span>
            </button>
            <button class="text-action" type="button" @click="completeTask(task.id)">Mark done</button>
          </article>
        </div>
        <p v-else class="focus-empty">Nothing waiting for review.</p>
      </section>

      <section class="focus-lane">
        <header>
          <h2>Completed</h2>
          <span>{{ doneTasks.length }} items</span>
        </header>
        <div class="focus-list" v-if="doneTasks.length">
          <article v-for="task in doneTasks" :key="task.id" class="focus-task is-done">
            <button type="button" @click="openTask(task.id)">
              <strong>{{ task.title }}</strong>
              <span>{{ projectName(task.projectId) }}</span>
            </button>
          </article>
        </div>
        <p v-else class="focus-empty">Completed tasks will appear here.</p>
      </section>
    </div>
  </section>
</template>
