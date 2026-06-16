import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useProjectsStore = defineStore("projects", () => {
  const list = ref([
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
  ]);

  const activeProjectId = ref("all");
  const activeProject = computed(() =>
    list.value.find((project) => project.id === activeProjectId.value),
  );

  function selectProject(projectId) {
    activeProjectId.value = projectId;
  }

  return {
    list,
    activeProjectId,
    activeProject,
    selectProject,
  };
});
