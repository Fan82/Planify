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
      <div class="activity-item">
        <span class="avatar mini">JL</span>
        <div>
          <div class="activity-text"><strong>James</strong> moved this task</div>
          <div class="activity-time">2h ago</div>
        </div>
      </div>
      <div class="activity-item">
        <span class="avatar mini">FY</span>
        <div>
          <div class="activity-text"><strong>Fan</strong> assigned {{ task.assignee }}</div>
          <div class="activity-time">Yesterday</div>
        </div>
      </div>
    </div>
  </div>
</template>
