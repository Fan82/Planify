<script setup>
import { computed } from "vue";
import TaskCard from "@/components/board/TaskCard.vue";
import { useTasksStore } from "@/stores/tasks";

const tasks = useTasksStore();

const stats = computed(() => [
  { label: "全部任務", value: tasks.tasks.length },
  { label: "進行中", value: tasks.openTasks.length },
  { label: "高優先", value: tasks.highPriorityTasks.length },
  { label: "即將到期", value: tasks.dueSoonTasks.length },
]);
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p>Today</p>
        <h1>團隊任務總覽</h1>
      </div>
      <RouterLink class="btn btn-primary" to="/board">開啟看板</RouterLink>
    </header>

    <div class="stats-grid">
      <article v-for="stat in stats" :key="stat.label" class="stat-card">
        <span>{{ stat.label }}</span>
        <strong>{{ stat.value }}</strong>
      </article>
    </div>

    <div class="content-grid">
      <section class="panel">
        <header class="panel-header">
          <h2>需要注意</h2>
          <span>{{ tasks.dueSoonTasks.length }} items</span>
        </header>
        <div class="task-list">
          <TaskCard
            v-for="task in tasks.dueSoonTasks"
            :key="task.id"
            :task="task"
            @open="tasks.selectTask"
          />
        </div>
      </section>
      <section class="panel">
        <header class="panel-header">
          <h2>已完成</h2>
          <span>{{ tasks.completedTasks.length }} items</span>
        </header>
        <div class="compact-list">
          <div v-for="task in tasks.completedTasks" :key="task.id">
            <strong>{{ task.title }}</strong>
            <span>{{ task.assignee }}</span>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>
