// =============================================================================
// MODEL — State management, pure functions, localStorage persistence
// =============================================================================

export const STORAGE_KEY = 'todolist-app-state';

export const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

export const initialState = {
  tasks: [],
  filter: 'all',
};

/**
 * @param {AppState} state
 * @param {string} text
 * @returns {AppState}
 */
export function addTask(state, text) {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 200) return state;
  const newTask = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
  };
  return { ...state, tasks: [...state.tasks, newTask] };
}

/**
 * @param {AppState} state
 * @param {string} id
 * @returns {AppState}
 */
export function toggleTask(state, id) {
  return {
    ...state,
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ),
  };
}

/**
 * @param {AppState} state
 * @param {string} id
 * @returns {AppState}
 */
export function deleteTask(state, id) {
  return { ...state, tasks: state.tasks.filter((task) => task.id !== id) };
}

/**
 * @param {AppState} state
 * @param {string} filter
 * @returns {AppState}
 */
export function setFilter(state, filter) {
  return { ...state, filter };
}

/**
 * Simpan state ke localStorage. Abaikan jika storage penuh.
 * @param {AppState} state
 */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // QuotaExceededError atau localStorage tidak tersedia — lanjutkan tanpa menyimpan
  }
}

/**
 * Muat state dari localStorage. Kembalikan initialState jika tidak valid.
 * @returns {AppState}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return initialState;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.tasks)) {
      return initialState;
    }
    return parsed;
  } catch (e) {
    return initialState;
  }
}


// =============================================================================
// VIEW — DOM rendering functions
// =============================================================================

/**
 * Kembalikan subset tasks sesuai filter, diurutkan ascending berdasarkan createdAt.
 * @param {Task[]} tasks
 * @param {string} filter - 'all' | 'active' | 'completed'
 * @returns {Task[]}
 */
export function getFilteredTasks(tasks, filter) {
  let filtered;
  if (filter === FILTERS.ACTIVE) {
    filtered = tasks.filter((t) => !t.completed);
  } else if (filter === FILTERS.COMPLETED) {
    filtered = tasks.filter((t) => t.completed);
  } else {
    filtered = tasks.slice();
  }
  return filtered.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Render daftar task ke elemen #task-list.
 * @param {Task[]} tasks
 * @param {string} filter
 */
export function renderTaskList(tasks, filter) {
  const list = document.getElementById('task-list');
  const filtered = getFilteredTasks(tasks, filter);

  if (filtered.length === 0) {
    list.innerHTML = '<li class="empty-state">Belum ada tugas. Tambahkan tugas baru!</li>';
    return;
  }

  list.innerHTML = filtered
    .map(
      (task) => `
    <li class="task-item${task.completed ? ' completed' : ''}" data-id="${task.id}">
      <input
        type="checkbox"
        class="task-checkbox"
        aria-label="Tandai selesai"
        ${task.completed ? 'checked' : ''}
      />
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="btn-delete" aria-label="Hapus tugas">Hapus</button>
    </li>`
    )
    .join('');
}

/**
 * Render ringkasan jumlah task belum selesai ke elemen #summary.
 * @param {Task[]} tasks
 */
export function renderSummary(tasks) {
  const summary = document.getElementById('summary');
  const incomplete = tasks.filter((t) => !t.completed).length;
  const total = tasks.length;
  summary.textContent = `${incomplete} dari ${total} tugas belum selesai`;
}

/**
 * Render tombol filter ke elemen #filter-bar, tandai tombol aktif.
 * @param {string} activeFilter
 */
export function renderFilters(activeFilter) {
  const bar = document.getElementById('filter-bar');
  bar.querySelectorAll('.filter-btn').forEach((btn) => {
    if (btn.dataset.filter === activeFilter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Entry point rendering — render seluruh UI berdasarkan state.
 * @param {AppState} state
 */
export function render(state) {
  renderTaskList(state.tasks, state.filter);
  renderSummary(state.tasks);
  renderFilters(state.filter);
}

/**
 * Escape karakter HTML untuk mencegah XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


// =============================================================================
// CONTROLLER — Event handlers and app initialization
// =============================================================================

/** @type {AppState} */
let appState;

/**
 * Handler untuk menambahkan task baru.
 * Baca nilai input, panggil addTask, simpan, kosongkan input, render.
 * Requirements: 1.2, 1.3, 1.4, 1.5
 */
function handleAddTask() {
  const input = document.getElementById('task-input');
  const text = input.value;
  const newState = addTask(appState, text);
  if (newState !== appState) {
    appState = newState;
    saveState(appState);
    input.value = '';
  }
  render(appState);
}

/**
 * Handler untuk toggle status selesai/belum selesai pada task.
 * Requirements: 3.1, 3.3, 6.1
 * @param {string} id
 */
function handleToggleTask(id) {
  appState = toggleTask(appState, id);
  saveState(appState);
  render(appState);
}

/**
 * Handler untuk menghapus task.
 * Requirements: 4.2, 6.1
 * @param {string} id
 */
function handleDeleteTask(id) {
  appState = deleteTask(appState, id);
  saveState(appState);
  render(appState);
}

/**
 * Handler untuk mengganti filter aktif.
 * Requirements: 5.2, 5.3, 5.4
 * @param {string} filter
 */
function handleFilterChange(filter) {
  appState = setFilter(appState, filter);
  saveState(appState);
  render(appState);
}

/**
 * Inisialisasi aplikasi: muat state, bind event listeners, render awal.
 * Requirements: 1.1, 1.2, 2.1, 5.5, 6.2
 */
function init() {
  appState = loadState();

  // Tombol tambah task
  const btnAdd = document.getElementById('btn-add');
  btnAdd.addEventListener('click', handleAddTask);

  // Input field — tambah task saat tekan Enter
  const input = document.getElementById('task-input');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAddTask();
  });

  // Filter buttons
  const filterBar = document.getElementById('filter-bar');
  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (btn) handleFilterChange(btn.dataset.filter);
  });

  // Event delegation pada task list untuk checkbox dan tombol hapus
  const taskList = document.getElementById('task-list');
  taskList.addEventListener('click', (e) => {
    const item = e.target.closest('.task-item');
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.classList.contains('task-checkbox')) {
      handleToggleTask(id);
    } else if (e.target.classList.contains('btn-delete')) {
      handleDeleteTask(id);
    }
  });

  render(appState);
}

// Panggil init() saat DOM siap
// Requirements: 6.2
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}
