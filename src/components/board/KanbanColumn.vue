<script setup>
import TaskCard from "./TaskCard.vue";

defineProps({
  column: { type: Object, required: true },
});

defineEmits(["open-task", "add-task", "move-task", "drag-start"]);
</script>

<template>
  <section class="kanban-column" @dragover.prevent @drop="$emit('move-task', column.id)">
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
        @drag-start="$emit('drag-start', $event)"
      />
      <div v-if="column.tasks.length === 0" class="empty-column">Drop tasks here</div>
    </div>
    <div class="col-add">
      <button class="col-add-btn" type="button" @click="$emit('add-task', column.id)">
        + Add task
      </button>
    </div>
  </section>
</template>
