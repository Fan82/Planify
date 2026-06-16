<script setup>
import PriorityBadge from "@/components/ui/PriorityBadge.vue";
import MemberAvatar from "@/components/members/MemberAvatar.vue";

defineProps({
  task: { type: Object, required: true },
});

defineEmits(["open"]);
</script>

<template>
  <button class="task-card" type="button" @click="$emit('open', task.id)">
    <h3 class="task-title">{{ task.title }}</h3>
    <div class="task-meta">
      <PriorityBadge :priority="task.priority" />
      <span class="task-tag">{{ task.tag }}</span>
      <div class="task-assignees">
        <MemberAvatar :name="task.assignee" />
      </div>
    </div>
    <div class="task-date">
      <span>{{ task.status === "done" ? "Done" : "Due" }}</span>
      <time :datetime="task.dueDate">{{ task.dueDate }}</time>
    </div>
  </button>
</template>
