import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "@/layouts/AppLayout.vue";
import BoardView from "@/views/BoardView.vue";
import CalendarView from "@/views/CalendarView.vue";
import MyTasksView from "@/views/MyTasksView.vue";
import OverviewView from "@/views/OverviewView.vue";
import SettingsView from "@/views/SettingsView.vue";

const routes = [
  {
    path: "/",
    component: AppLayout,
    children: [
      { path: "", name: "overview", component: OverviewView },
      { path: "board", name: "board", component: BoardView },
      { path: "my-tasks", name: "my-tasks", component: MyTasksView },
      { path: "calendar", name: "calendar", component: CalendarView },
      { path: "settings", name: "settings", component: SettingsView },
    ],
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
