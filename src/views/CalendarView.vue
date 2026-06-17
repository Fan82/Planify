<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import PriorityBadge from "@/components/ui/PriorityBadge.vue";
import { useTasksStore } from "@/stores/tasks";

const tasks = useTasksStore();
const router = useRouter();

const today = new Date();
const curYear = ref(today.getFullYear());
const curMonth = ref(today.getMonth()); // 0-indexed

const selectedDate = ref(today.toISOString().slice(0, 10));

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DOWS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── helpers ──────────────────────────────────────────────
function toIso(year, month, day) {
  return new Date(year, month, day).toISOString().slice(0, 10);
}

function tasksByDate(dateStr) {
  return tasks.tasks.filter((t) => t.dueDate === dateStr);
}

// ── calendar grid cells ───────────────────────────────────
const calendarCells = computed(() => {
  const year = curYear.value;
  const month = curMonth.value;
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevTotal = new Date(year, month, 0).getDate();
  const total = Math.ceil((firstDow + daysInMonth) / 7) * 7;

  return Array.from({ length: total }, (_, i) => {
    let dateStr, dayNum, otherMonth = false;
    if (i < firstDow) {
      dayNum = prevTotal - firstDow + i + 1;
      dateStr = toIso(year, month - 1, dayNum);
      otherMonth = true;
    } else if (i >= firstDow + daysInMonth) {
      dayNum = i - firstDow - daysInMonth + 1;
      dateStr = toIso(year, month + 1, dayNum);
      otherMonth = true;
    } else {
      dayNum = i - firstDow + 1;
      dateStr = toIso(year, month, dayNum);
    }
    return {
      dateStr,
      dayNum,
      otherMonth,
      isToday: dateStr === today.toISOString().slice(0, 10),
      isSelected: dateStr === selectedDate.value,
      tasks: tasksByDate(dateStr),
    };
  });
});

const calTitle = computed(() => `${MONTHS[curMonth.value]} ${curYear.value}`);

const selectedTasks = computed(() => tasksByDate(selectedDate.value));

const selectedLabel = computed(() => {
  const d = new Date(selectedDate.value + "T00:00:00");
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
});

// ── navigation ────────────────────────────────────────────
function prevMonth() {
  if (curMonth.value === 0) { curMonth.value = 11; curYear.value--; }
  else curMonth.value--;
}
function nextMonth() {
  if (curMonth.value === 11) { curMonth.value = 0; curYear.value++; }
  else curMonth.value++;
}
function goToday() {
  curYear.value = today.getFullYear();
  curMonth.value = today.getMonth();
  selectedDate.value = today.toISOString().slice(0, 10);
}

function selectDay(cell) {
  selectedDate.value = cell.dateStr;
  if (cell.otherMonth) {
    const d = new Date(cell.dateStr + "T00:00:00");
    curYear.value = d.getFullYear();
    curMonth.value = d.getMonth();
  }
}

// ── status helpers ────────────────────────────────────────
function pillClass(status) {
  return { doing: "pill-doing", review: "pill-review", todo: "pill-todo", done: "pill-done" }[status] || "pill-todo";
}

function openTask(taskId) {
  tasks.selectTask(taskId);
  router.push("/board");
}
</script>

<template>
  <section class="page cal-page">

    <!-- topbar -->
    <header class="cal-topbar">
      <div class="cal-nav">
        <button class="nav-btn" type="button" aria-label="Previous month" @click="prevMonth">‹</button>
        <span class="cal-title">{{ calTitle }}</span>
        <button class="nav-btn" type="button" aria-label="Next month" @click="nextMonth">›</button>
      </div>
      <button class="today-btn" type="button" @click="goToday">Today</button>
    </header>

    <!-- month grid -->
    <div class="cal-wrap">
      <!-- day-of-week header -->
      <div class="dow-row">
        <div v-for="d in DOWS" :key="d" class="dow">{{ d }}</div>
      </div>

      <!-- cells -->
      <div class="cal-grid">
        <button v-for="(cell, idx) in calendarCells" :key="idx" type="button" class="cal-cell" :class="{
          'other-month': cell.otherMonth,
          'is-today': cell.isToday,
          'is-selected': cell.isSelected,
        }" @click="selectDay(cell)">
          <span class="day-num">{{ cell.dayNum }}</span>

          <!-- show up to 2 pills, rest as dots -->
          <template v-if="cell.tasks.length">
            <span v-for="t in cell.tasks.slice(0, 2)" :key="t.id" class="task-pill" :class="pillClass(t.status)">{{
              t.title }}</span>
            <div v-if="cell.tasks.length > 2" class="extra-dots">
              <span v-for="t in cell.tasks.slice(2)" :key="t.id" class="dot" :class="'dot-' + t.status"></span>
            </div>
          </template>
        </button>
      </div>
    </div>

    <!-- detail panel below calendar -->
    <div class="detail-strip">
      <div class="strip-header">
        <span class="strip-date">{{ selectedLabel }}</span>
        <span class="strip-count">
          {{ selectedTasks.length ? selectedTasks.length + ' task' + (selectedTasks.length > 1 ? 's' : '') : 'No tasks'
          }}
        </span>
      </div>

      <div v-if="selectedTasks.length" class="strip-list">
        <button v-for="t in selectedTasks" :key="t.id" class="strip-task" type="button" @click="openTask(t.id)">
          <div class="strip-task-title">{{ t.title }}</div>
          <div class="strip-task-meta">
            <PriorityBadge :priority="t.priority" />
            <StatusBadge :status="t.status" />
            <span class="strip-assignee">{{ t.assignee }}</span>
          </div>
        </button>
      </div>

      <div v-else class="strip-empty">
        No tasks due
      </div>
    </div>

  </section>
</template>

<style scoped>
.cal-page {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  overflow: auto;
}

/* topbar */
.cal-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 0.5px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}

.cal-nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cal-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  min-width: 140px;
  text-align: center;
}

.nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 0.5px solid var(--border);
  background: transparent;
  color: var(--muted);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
}

.nav-btn:hover {
  background: var(--surface2);
  color: var(--text);
}

.today-btn {
  padding: 4px 12px;
  border-radius: 6px;
  border: 0.5px solid var(--border);
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  transition: background 0.12s;
}

.today-btn:hover {
  background: var(--surface2);
  color: var(--text);
}

/* grid wrapper */
.cal-wrap {
  flex-shrink: 0;
  border-bottom: 0.5px solid var(--border);
}

.dow-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 0.5px solid var(--border);
  background: var(--surface);
}

.dow {
  text-align: center;
  font-size: 11px;
  color: var(--muted);
  padding: 7px 0;
  font-weight: 500;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

/* cells */
.cal-cell {
  border: none;
  border-right: 0.5px solid var(--border);
  border-bottom: 0.5px solid var(--border);
  background: var(--bg);
  padding: 6px;
  min-height: 80px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
  transition: background 0.12s;
}

.cal-cell:nth-child(7n) {
  border-right: none;
}

.cal-cell:hover {
  background: var(--surface2);
}

.cal-cell.is-selected {
  background: var(--surface2);
}

.day-num {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.cal-cell.other-month .day-num {
  color: var(--muted);
}

.cal-cell.is-today .day-num {
  background: var(--accent);
  color: #fff;
}

/* task pills */
.task-pill {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  display: block;
}

.pill-doing {
  background: rgba(239, 159, 39, .18);
  color: #854f0b;
}

.pill-review {
  background: rgba(124, 111, 205, .18);
  color: #3c3489;
}

.pill-todo {
  background: rgba(107, 107, 130, .14);
  color: var(--muted);
}

.pill-done {
  background: rgba(29, 158, 117, .14);
  color: #085041;
}

.extra-dots {
  display: flex;
  gap: 3px;
  padding-top: 2px;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-doing {
  background: #ef9f27;
}

.dot-review {
  background: #7c6fcd;
}

.dot-todo {
  background: var(--muted);
}

.dot-done {
  background: #1d9e75;
}

/* detail strip */
.detail-strip {
  flex-shrink: 0;
  background: var(--surface);
  padding: 14px 20px;
}

.strip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.strip-date {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.strip-count {
  font-size: 11px;
  color: var(--muted);
}

.strip-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.strip-task {
  background: var(--surface2);
  border: 0.5px solid var(--border);
  border-radius: 8px;
  padding: 9px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.strip-task-title {
  font-size: 12px;
  color: var(--text);
  flex: 1;
}

.strip-task-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.strip-assignee {
  font-size: 11px;
  color: var(--muted);
}

.strip-empty {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  padding: 12px 0;
}

@media (max-width: 700px) {
  .cal-topbar {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
  }

  .cal-nav {
    justify-content: space-between;
  }

  .cal-title {
    min-width: 0;
    flex: 1;
  }

  .today-btn {
    min-height: 34px;
  }

  .cal-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .dow-row,
  .cal-grid {
    min-width: 640px;
  }

  .cal-cell {
    min-height: 68px;
    padding: 5px;
  }

  .task-pill {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .detail-strip {
    padding: 12px;
  }

  .strip-header,
  .strip-task-meta {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .dow-row,
  .cal-grid {
    min-width: 560px;
  }

  .cal-cell {
    min-height: 60px;
  }
}
</style>