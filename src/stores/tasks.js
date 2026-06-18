import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { loadPersisted, persistRef } from "@/utils/persistence";

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

export const CURRENT_USER = "Fan (You)";

export const useTasksStore = defineStore("tasks", () => {
  const defaultTasks = [
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
      activity: ["Fan created this task", "James moved this to In Progress"],
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
      activity: ["Fan created this task"],
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
      activity: ["James picked this up"],
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
      activity: ["Sara added campaign notes"],
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
      activity: ["Mike requested review"],
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
      activity: ["Fan created this task"],
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
      activity: ["James sent docs for review"],
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
      activity: ["Sara created outline"],
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
      activity: ["Sara completed interviews", "Fan marked this done"],
    },
  ];

  const tasks = ref(loadPersisted("planify:tasks", defaultTasks));
  const selectedTaskId = ref(null);

  persistRef("planify:tasks", tasks);
  const selectedTask = computed(() =>
    tasks.value.find((task) => task.id === selectedTaskId.value),
  );

  const openTasks = computed(() =>
    tasks.value.filter((task) => task.status !== "done"),
  );
  const completedTasks = computed(() =>
    tasks.value.filter((task) => task.status === "done"),
  );
  const myTasks = computed(() =>
    tasks.value.filter((task) => task.assignee === CURRENT_USER),
  );
  const highPriorityTasks = computed(() =>
    tasks.value.filter((task) => task.priority === "high" && task.status !== "done"),
  );
  const dueSoonTasks = computed(() => {
    const limit = new Date(today);
    limit.setDate(today.getDate() + 7);
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

  function addActivity(task, message) {
    task.activity = [message, ...(task.activity || [])].slice(0, 8);
  }

  function createTask(payload) {
    const task = {
      id: crypto.randomUUID(),
      title: payload.title.trim(),
      description: payload.description?.trim() || "No description yet.",
      status: payload.status || "todo",
      priority: payload.priority || "medium",
      projectId: payload.projectId || "project-product",
      assignee: payload.assignee?.trim() || CURRENT_USER,
      tag: payload.tag?.trim() || "General",
      dueDate: payload.dueDate || isoAfter(3),
      activity: [`${CURRENT_USER} created this task`],
    };
    tasks.value.unshift(task);
    selectedTaskId.value = task.id;
    return task;
  }

  function createGoalPlan(payload) {
    const goal = payload.title.trim();
    if (!goal) return [];

    const dueDate = payload.dueDate || isoAfter(7);
    const baseTask = {
      priority: payload.priority || "medium",
      projectId: payload.projectId || "project-product",
      assignee: payload.assignee?.trim() || CURRENT_USER,
      dueDate,
      tag: "Goal",
    };

    const created = [
      {
        ...baseTask,
        id: crypto.randomUUID(),
        title: `Define success criteria: ${goal}`,
        description: payload.description?.trim() || `Clarify the target outcome for ${goal}.`,
        status: "todo",
        activity: [`${CURRENT_USER} created this goal plan`],
      },
      {
        ...baseTask,
        id: crypto.randomUUID(),
        title: `Plan first milestone: ${goal}`,
        description: "Break the goal into the first concrete milestone and owner.",
        status: "todo",
        activity: [`${CURRENT_USER} created this goal plan`],
      },
      {
        ...baseTask,
        id: crypto.randomUUID(),
        title: `Execute next action: ${goal}`,
        description: "Start the highest-leverage action that moves this goal forward.",
        status: "doing",
        activity: [`${CURRENT_USER} created this goal plan`],
      },
      {
        ...baseTask,
        id: crypto.randomUUID(),
        title: `Review progress: ${goal}`,
        description: "Check progress, blockers, and the next adjustment.",
        status: "review",
        activity: [`${CURRENT_USER} created this goal plan`],
      },
    ];

    tasks.value.unshift(...created);
    selectedTaskId.value = created[0].id;
    return created;
  }

  function updateTask(taskId, patch) {
    const task = tasks.value.find((item) => item.id === taskId);
    if (!task) return null;
    Object.assign(task, patch);
    addActivity(task, `${CURRENT_USER} updated this task`);
    return task;
  }

  function moveTask(taskId, status) {
    const task = tasks.value.find((item) => item.id === taskId);
    if (!task || task.status === status) return;
    task.status = status;
    addActivity(task, `${CURRENT_USER} moved this to ${TASK_STATUSES.find((item) => item.id === status)?.label || status}`);
  }

  function deleteTask(taskId) {
    const index = tasks.value.findIndex((task) => task.id === taskId);
    if (index === -1) return;
    tasks.value.splice(index, 1);
    if (selectedTaskId.value === taskId) {
      selectedTaskId.value = tasks.value[index]?.id ?? tasks.value[index - 1]?.id ?? null;
    }
  }

  function duplicateTask(taskId) {
    const source = tasks.value.find((task) => task.id === taskId);
    if (!source) return null;
    const clone = {
      ...source,
      id: crypto.randomUUID(),
      title: `${source.title} copy`,
      status: "todo",
      activity: [`${CURRENT_USER} duplicated this task`],
    };
    tasks.value.unshift(clone);
    selectedTaskId.value = clone.id;
    return clone;
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
    myTasks,
    highPriorityTasks,
    dueSoonTasks,
    tasksByStatus,
    createTask,
    createGoalPlan,
    updateTask,
    moveTask,
    deleteTask,
    duplicateTask,
    selectTask,
  };
});
