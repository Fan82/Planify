import { createPinia } from "pinia";
import { createApp } from "vue";
import router from "./router";
import "./style.css";
import App from "./App.vue";
import { useAuthStore } from "./stores/auth";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Stores can be used after Pinia is installed.
const auth = useAuthStore();
auth.init(); // Read the current session and subscribe to auth changes.

app.mount("#app");
