import { watch } from "vue";

export function loadPersisted(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function persistRef(key, source) {
  if (typeof window === "undefined") return;

  watch(
    source,
    (value) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    { deep: true },
  );
}
