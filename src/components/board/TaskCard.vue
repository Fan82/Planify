<script setup>
import MemberAvatar from "@/components/members/MemberAvatar.vue";

defineProps({
  task: { type: Object, required: true },
  isDragging: { type: Boolean, default: false },
});

defineEmits(["open", "drag-start", "drag-end"]);
</script>

<template>
  <button
    class="task-card"
    :class="{ 'is-done': task.status === 'done', 'is-dragging': isDragging }"
    type="button"
    draggable="true"
    @click="$emit('open', task.id)"
    @dragstart="$emit('drag-start', task.id)"
    @dragend="$emit('drag-end')"
  >
    <h3 class="task-title">{{ task.title }}</h3>
    <div class="task-meta">
      <span class="task-tag">{{ task.tag }}</span>
      <div class="task-assignees">
        <MemberAvatar :name="task.assignee" single />
      </div>
    </div>
  </button>
</template>
