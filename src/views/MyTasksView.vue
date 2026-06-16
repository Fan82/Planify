<script setup>
import { computed } from "vue";
import TaskCard from "@/components/board/TaskCard.vue";
import { useTasksStore } from "@/stores/tasks";

const tasks = useTasksStore();
const myTasks = computed(() => tasks.tasks.filter((task) => task.assignee === "Fan"));
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <p>Mine</p>
        <h1>我的任務</h1>
      </div>
    </header>
    <div class="task-list wide">
      <TaskCard
        v-for="task in myTasks"
        :key="task.id"
        :task="task"
        @open="tasks.selectTask"
      />
    </div>
  </section>
</template>
