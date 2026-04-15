// =============================================================================
// MODEL — State management, pure functions, localStorage persistence
// =============================================================================

const STORAGE_KEY = 'todolist-app-state';

const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

const initialState = {
  tasks: [],
  filter: 'all',
};

/**
 * @param {AppState} state
 * @param {string} text
 * @returns {AppState}
 */
function addTask(state, text) {
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
function toggleTask(state, id) {
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
function deleteTask(state, id) {
  return { ...state, tasks: state.tasks.filter((task) => task.id !== id) };
}

/**
 * @param {AppState} state
 * @param {string} filter
 * @returns {AppState}
 */
function setFilter(state, filter) {
  return { ...state, filter };
}



// =============================================================================
// VIEW — DOM rendering functions
// =============================================================================



// =============================================================================
// CONTROLLER — Event handlers and app initialization
// =============================================================================
