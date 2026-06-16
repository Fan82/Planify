<script setup>
import TaskCard from "./TaskCard.vue";

defineProps({
  column: { type: Object, required: true },
});

defineEmits(["open-task"]);
</script>

<template>
  <section class="kanban-column">
    <header class="col-header">
      <span class="col-dot" :style="{ background: column.color }"></span>
      <h2>{{ column.label }}</h2>
      <span>{{ column.tasks.length }}</span>
    </header>
    <div class="kanban-list">
      <TaskCard
        v-for="task in column.tasks"
        :key="task.id"
        :task="task"
        @open="$emit('open-task', $event)"
      />
      <div v-if="column.tasks.length === 0" class="empty-column">沒有任務</div>
    </div>
    <div class="col-add">
      <button class="col-add-btn" type="button">+ Add task</button>
    </div>
  </section>
</template>
