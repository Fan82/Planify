<script setup>
defineProps({
  task: { type: Object, default: null },
});
</script>

<template>
  <div class="activity-log">
    <div class="field-label">Activity</div>
    <p v-if="!task">Select a task to view updates.</p>
    <div v-else class="activity-list">
      <div v-for="(item, index) in task.activity || []" :key="`${task.id}-${index}`" class="activity-item">
        <span class="avatar mini">{{ index === 0 ? 'FY' : 'JL' }}</span>
        <div>
          <div class="activity-text">{{ item }}</div>
          <div class="activity-time">{{ index === 0 ? 'Just now' : 'Earlier' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
