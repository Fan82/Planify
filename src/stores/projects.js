import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { loadPersisted, persistRef } from "@/utils/persistence";

const PROJECT_COLORS = ["#7c6fcd", "#1d9e75", "#ef9f27", "#e24b4a", "#3b82f6"];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const useProjectsStore = defineStore("projects", () => {
  const defaultProjects = [
    {
      id: "project-product",
      name: "Q3 Product Launch",
      color: "#7c6fcd",
      description: "Launch planning, product messaging, and rollout execution.",
    },
    {
      id: "project-ops",
      name: "Website Redesign",
      color: "#1d9e75",
      description: "Design and implementation work for the marketing website.",
    },
    {
      id: "project-client",
      name: "Onboarding Flow",
      color: "#ef9f27",
      description: "Customer onboarding tasks and cross-functional handoffs.",
    },
  ];

  const list = ref(loadPersisted("planify:projects", defaultProjects));
  const activeProjectId = ref(loadPersisted("planify:active-project-id", "all"));

  if (activeProjectId.value !== "all" && !list.value.some((project) => project.id === activeProjectId.value)) {
    activeProjectId.value = "all";
  }

  persistRef("planify:projects", list);
  persistRef("planify:active-project-id", activeProjectId);
  const activeProject = computed(() =>
    list.value.find((project) => project.id === activeProjectId.value),
  );

  function selectProject(projectId) {
    activeProjectId.value = projectId;
  }

  function createProject(payload) {
    const name = payload.name?.trim();
    if (!name) return null;

    const slug = slugify(name) || "project";
    const id = `project-${slug}-${Date.now().toString(36)}`;
    const project = {
      id,
      name,
      color: payload.color || PROJECT_COLORS[list.value.length % PROJECT_COLORS.length],
      description: payload.description?.trim() || "New workspace project.",
    };

    list.value.push(project);
    activeProjectId.value = project.id;
    return project;
  }

  return {
    list,
    activeProjectId,
    activeProject,
    projectColors: PROJECT_COLORS,
    selectProject,
    createProject,
  };
});
