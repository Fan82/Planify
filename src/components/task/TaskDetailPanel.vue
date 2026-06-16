<script setup>
import { computed } from "vue";
import MemberAvatar from "@/components/members/MemberAvatar.vue";
import PriorityBadge from "@/components/ui/PriorityBadge.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import { TASK_STATUSES, useTasksStore } from "@/stores/tasks";
import TaskActivityLog from "./TaskActivityLog.vue";

const tasks = useTasksStore();
const task = computed(() => tasks.selectedTask);
</script>

<template>
  <aside class="detail-panel">
    <template v-if="task">
      <div class="panel-header">
        <h2>{{ task.title }}</h2>
        <button type="button" class="panel-close" @click="tasks.selectTask(null)">×</button>
      </div>
      <div class="panel-body">
        <div>
          <div class="field-label">Status</div>
          <select
            class="field-control"
            :value="task.status"
            @change="tasks.moveTask(task.id, $event.target.value)"
          >
            <option v-for="status in TASK_STATUSES" :key="status.id" :value="status.id">
              {{ status.label }}
            </option>
          </select>
        </div>
        <div>
          <div class="field-label">Priority</div>
          <PriorityBadge :priority="task.priority" />
        </div>
        <div>
          <div class="field-label">Project</div>
          <span class="field-val">{{ task.tag }}</span>
        </div>
        <div>
          <div class="field-label">Due date</div>
          <span class="field-val">{{ task.dueDate }}</span>
        </div>
        <div>
          <div class="field-label">Assignees</div>
          <div class="assignee-item">
            <MemberAvatar :name="task.assignee" />
            <span class="assignee-name">{{ task.assignee }}</span>
            <span class="assignee-role-badge">member</span>
          </div>
        </div>
        <div>
          <div class="field-label">Description</div>
          <p class="field-val description">{{ task.description }}</p>
        </div>
        <TaskActivityLog :task="task" />
      </div>
    </template>
    <div v-else class="empty-detail">
      <h2>Select a task</h2>
      <p>Click a card to inspect status, assignee, due date, and activity.</p>
    </div>
  </aside>
</template>
