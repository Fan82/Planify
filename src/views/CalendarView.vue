<script setup>
import { computed } from "vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import { useTasksStore } from "@/stores/tasks";

const tasks = useTasksStore();
const scheduledTasks = computed(() =>
  [...tasks.tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
);
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p>Schedule</p>
        <h1>行事曆</h1>
      </div>
    </header>
    <div class="timeline">
      <article v-for="task in scheduledTasks" :key="task.id">
        <time :datetime="task.dueDate">{{ task.dueDate }}</time>
        <div>
          <strong>{{ task.title }}</strong>
          <span>{{ task.assignee }}</span>
        </div>
        <StatusBadge :status="task.status" />
      </article>
    </div>
  </section>
</template>
