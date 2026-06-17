<script setup>
import { computed, reactive, watch } from "vue";
import MemberAvatar from "@/components/members/MemberAvatar.vue";
import { useProjectsStore } from "@/stores/projects";
import { PRIORITIES, TASK_STATUSES, useTasksStore } from "@/stores/tasks";
import TaskActivityLog from "./TaskActivityLog.vue";

const tasks = useTasksStore();
const projects = useProjectsStore();
const task = computed(() => tasks.selectedTask);

const form = reactive({
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  projectId: "project-product",
  dueDate: "",
  assignee: "",
  tag: "",
});

watch(
  task,
  (value) => {
    if (!value) return;
    Object.assign(form, {
      title: value.title,
      description: value.description,
      status: value.status,
      priority: value.priority,
      projectId: value.projectId,
      dueDate: value.dueDate,
      assignee: value.assignee,
      tag: value.tag,
    });
  },
  { immediate: true },
);

const projectName = computed(() =>
  projects.list.find((project) => project.id === form.projectId)?.name || "No project",
);

function saveTask() {
  if (!task.value || !form.title.trim()) return;
  tasks.updateTask(task.value.id, {
    title: form.title.trim(),
    description: form.description.trim() || "No description yet.",
    status: form.status,
    priority: form.priority,
    projectId: form.projectId,
    dueDate: form.dueDate,
    assignee: form.assignee.trim() || "Unassigned",
    tag: form.tag.trim() || "General",
  });
}

function deleteCurrentTask() {
  if (!task.value) return;
  tasks.deleteTask(task.value.id);
}
</script>

<template>
  <aside class="detail-panel">
    <template v-if="task">
      <div class="panel-header">
        <h2>{{ task.title }}</h2>
        <button type="button" class="panel-close" @click="tasks.selectTask(null)">×</button>
      </div>
      <div class="panel-body">
        <div class="detail-editor">
          <label class="field" for="detail-title">
            <span>Title</span>
            <input id="detail-title" v-model="form.title" />
          </label>
          <label class="field" for="detail-description">
            <span>Description</span>
            <textarea id="detail-description" v-model="form.description"></textarea>
          </label>
          <div class="form-grid compact">
            <label class="field" for="detail-status">
              <span>Status</span>
              <select id="detail-status" v-model="form.status">
                <option v-for="status in TASK_STATUSES" :key="status.id" :value="status.id">
                  {{ status.label }}
                </option>
              </select>
            </label>
            <label class="field" for="detail-priority">
              <span>Priority</span>
              <select id="detail-priority" v-model="form.priority">
                <option v-for="priority in PRIORITIES" :key="priority.id" :value="priority.id">
                  {{ priority.label }}
                </option>
              </select>
            </label>
            <label class="field" for="detail-project">
              <span>Project</span>
              <select id="detail-project" v-model="form.projectId">
                <option v-for="project in projects.list" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
            </label>
            <label class="field" for="detail-date">
              <span>Due date</span>
              <input id="detail-date" v-model="form.dueDate" type="date" />
            </label>
            <label class="field" for="detail-assignee">
              <span>Assignee</span>
              <input id="detail-assignee" v-model="form.assignee" />
            </label>
            <label class="field" for="detail-tag">
              <span>Tag</span>
              <input id="detail-tag" v-model="form.tag" />
            </label>
          </div>
          <div class="detail-actions">
            <button class="mini-btn" type="button" @click="tasks.duplicateTask(task.id)">Duplicate</button>
            <button class="mini-btn danger" type="button" @click="deleteCurrentTask">Delete</button>
            <button class="mini-btn primary" type="button" @click="saveTask">Save</button>
          </div>
        </div>

        <div>
          <div class="field-label">Assignee</div>
          <div class="assignee-item">
            <MemberAvatar :name="form.assignee" />
            <span class="assignee-name">{{ form.assignee }}</span>
            <span class="assignee-role-badge">member</span>
          </div>
        </div>
        <div>
          <div class="field-label">Project</div>
          <span class="field-val">{{ projectName }}</span>
        </div>
        <TaskActivityLog :task="task" />
      </div>
    </template>
    <div v-else class="empty-detail">
      <h2>Select a task</h2>
      <p>Click a card to inspect, edit, move, duplicate, or delete it.</p>
    </div>
  </aside>
</template>
