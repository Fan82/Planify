import { defineStore } from "pinia";
import { computed, ref } from "vue";

const today = new Date();
const isoAfter = (days) => {
  const date = new Date(today);
  date.setDate(today.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const TASK_STATUSES = [
  { id: "todo", label: "Backlog", color: "#6b6b82" },
  { id: "doing", label: "In Progress", color: "#ef9f27" },
  { id: "review", label: "In Review", color: "#7c6fcd" },
  { id: "done", label: "Done", color: "#1d9e75" },
];

export const PRIORITIES = [
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

export const useTasksStore = defineStore("tasks", () => {
  const tasks = ref([
    {
      id: "task-1",
      title: "Landing page - hero section redesign",
      description: "Redesign hero section based on user interview findings. Focus on value prop clarity and CTA conversion.",
      status: "doing",
      priority: "high",
      projectId: "project-product",
      assignee: "Fan (You)",
      tag: "Design",
      dueDate: isoAfter(4),
    },
    {
      id: "task-2",
      title: "Define success metrics for launch",
      description: "Align product, marketing, and sales on launch measurement.",
      status: "todo",
      priority: "medium",
      projectId: "project-product",
      assignee: "Fan (You)",
      tag: "Strategy",
      dueDate: isoAfter(8),
    },
    {
      id: "task-3",
      title: "Set up analytics tracking (Mixpanel)",
      description: "Track activation, onboarding drop-off, and conversion events.",
      status: "doing",
      priority: "high",
      projectId: "project-product",
      assignee: "James L.",
      tag: "Engineering",
      dueDate: isoAfter(6),
    },
    {
      id: "task-4",
      title: "Email campaign - 3-touch sequence",
      description: "Draft the pre-launch and post-launch email campaign.",
      status: "doing",
      priority: "medium",
      projectId: "project-product",
      assignee: "Sara R.",
      tag: "Marketing",
      dueDate: isoAfter(9),
    },
    {
      id: "task-5",
      title: "Onboarding checklist UI",
      description: "Design the interactive checklist for new workspace setup.",
      status: "review",
      priority: "high",
      projectId: "project-client",
      assignee: "Mike K.",
      tag: "Design",
      dueDate: isoAfter(2),
    },
    {
      id: "task-6",
      title: "Competitive analysis - 3 key players",
      description: "Summarize competitor positioning and pricing model patterns.",
      status: "todo",
      priority: "low",
      projectId: "project-product",
      assignee: "Mike K.",
      tag: "Research",
      dueDate: isoAfter(12),
    },
    {
      id: "task-7",
      title: "API rate limit documentation",
      description: "Add API quota behavior and error recovery examples.",
      status: "review",
      priority: "medium",
      projectId: "project-ops",
      assignee: "James L.",
      tag: "Docs",
      dueDate: isoAfter(3),
    },
    {
      id: "task-8",
      title: "Draft press release template",
      description: "Prepare the initial product launch announcement template.",
      status: "todo",
      priority: "low",
      projectId: "project-product",
      assignee: "Sara R.",
      tag: "Content",
      dueDate: isoAfter(15),
    },
    {
      id: "task-9",
      title: "User interview - 5 participants",
      description: "Interview early users and synthesize feedback themes.",
      status: "done",
      priority: "low",
      projectId: "project-product",
      assignee: "Sara R.",
      tag: "Research",
      dueDate: isoAfter(-2),
    },
  ]);

  const selectedTaskId = ref(null);
  const selectedTask = computed(() =>
    tasks.value.find((task) => task.id === selectedTaskId.value),
  );

  const openTasks = computed(() =>
    tasks.value.filter((task) => task.status !== "done"),
  );
  const completedTasks = computed(() =>
    tasks.value.filter((task) => task.status === "done"),
  );
  const highPriorityTasks = computed(() =>
    tasks.value.filter((task) => task.priority === "high" && task.status !== "done"),
  );
  const dueSoonTasks = computed(() => {
    const limit = new Date(today);
    limit.setDate(today.getDate() + 3);
    return tasks.value.filter((task) => {
      const dueDate = new Date(task.dueDate);
      return task.status !== "done" && dueDate <= limit;
    });
  });

  const tasksByStatus = computed(() =>
    TASK_STATUSES.map((status) => ({
      ...status,
      tasks: tasks.value.filter((task) => task.status === status.id),
    })),
  );

  function createTask(payload) {
    const task = {
      id: crypto.randomUUID(),
      title: payload.title.trim(),
      description: payload.description?.trim() || "尚未補充說明。",
      status: payload.status || "todo",
      priority: payload.priority || "medium",
      projectId: payload.projectId || "project-product",
      assignee: payload.assignee?.trim() || "Fan (You)",
      tag: payload.tag?.trim() || "General",
      dueDate: payload.dueDate || isoAfter(3),
    };
    tasks.value.unshift(task);
    return task;
  }

  function updateTask(taskId, patch) {
    const task = tasks.value.find((item) => item.id === taskId);
    if (!task) return;
    Object.assign(task, patch);
  }

  function moveTask(taskId, status) {
    updateTask(taskId, { status });
  }

  function selectTask(taskId) {
    selectedTaskId.value = taskId;
  }

  return {
    tasks,
    selectedTaskId,
    selectedTask,
    openTasks,
    completedTasks,
    highPriorityTasks,
    dueSoonTasks,
    tasksByStatus,
    createTask,
    updateTask,
    moveTask,
    selectTask,
  };
});
