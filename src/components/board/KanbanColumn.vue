<script setup>
import { ref } from "vue";
import TaskCard from "./TaskCard.vue";

const props = defineProps({
  column: { type: Object, required: true },
  draggedTaskId: { type: String, default: null },
});

defineEmits(["open-task", "add-task", "move-task", "drag-start", "drag-end"]);

const isOver = ref(false);
</script>

<template>
  <section
    class="kanban-column"
    :class="{ 'is-over': isOver }"
    @dragenter.prevent="isOver = true"
    @dragleave.self="isOver = false"
    @dragover.prevent
    @drop="isOver = false; $emit('move-task', column.id)"
  >
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
        :is-dragging="props.draggedTaskId === task.id"
        @open="$emit('open-task', $event)"
        @drag-start="$emit('drag-start', $event)"
        @drag-end="$emit('drag-end')"
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
