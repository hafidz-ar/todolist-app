// Unit tests (example-based) for todolist-app Model functions

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { addTask, toggleTask, deleteTask, setFilter, saveState, loadState, initialState, FILTERS } from '../app.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeState(tasks = [], filter = 'all') {
  return { tasks, filter };
}

function makeTask(overrides = {}) {
  return {
    id: 'test-id-1',
    text: 'Belajar JavaScript',
    completed: false,
    createdAt: 1700000000000,
    ...overrides,
  };
}

// ─── addTask ────────────────────────────────────────────────────────────────

describe('addTask', () => {
  it('menambahkan task baru ke state kosong', () => {
    const state = makeState();
    const newState = addTask(state, 'Beli kopi');
    expect(newState.tasks).toHaveLength(1);
    expect(newState.tasks[0].text).toBe('Beli kopi');
    expect(newState.tasks[0].completed).toBe(false);
  });

  it('task baru memiliki id, text, completed, createdAt', () => {
    const state = makeState();
    const newState = addTask(state, 'Test task');
    const task = newState.tasks[0];
    expect(task.id).toBeDefined();
    expect(task.text).toBe('Test task');
    expect(task.completed).toBe(false);
    expect(typeof task.createdAt).toBe('number');
  });

  it('trim whitespace dari teks input', () => {
    const state = makeState();
    const newState = addTask(state, '  Tugas penting  ');
    expect(newState.tasks[0].text).toBe('Tugas penting');
  });

  it('menolak input kosong — state tidak berubah', () => {
    const state = makeState();
    expect(addTask(state, '')).toEqual(state);
    expect(addTask(state, '   ')).toEqual(state);
    expect(addTask(state, '\t\n')).toEqual(state);
  });

  it('menolak teks lebih dari 200 karakter — state tidak berubah', () => {
    const state = makeState();
    const longText = 'a'.repeat(201);
    expect(addTask(state, longText)).toEqual(state);
  });

  it('teks tepat 200 karakter diterima', () => {
    const state = makeState();
    const text200 = 'a'.repeat(200);
    const newState = addTask(state, text200);
    expect(newState.tasks).toHaveLength(1);
  });

  it('tidak memutasi state asli', () => {
    const state = makeState();
    const original = JSON.stringify(state);
    addTask(state, 'Task baru');
    expect(JSON.stringify(state)).toBe(original);
  });
});

// ─── toggleTask ─────────────────────────────────────────────────────────────

describe('toggleTask', () => {
  it('mengubah completed dari false ke true', () => {
    const task = makeTask({ completed: false });
    const state = makeState([task]);
    const newState = toggleTask(state, 'test-id-1');
    expect(newState.tasks[0].completed).toBe(true);
  });

  it('mengubah completed dari true ke false', () => {
    const task = makeTask({ completed: true });
    const state = makeState([task]);
    const newState = toggleTask(state, 'test-id-1');
    expect(newState.tasks[0].completed).toBe(false);
  });

  it('hanya mengubah task dengan id yang sesuai', () => {
    const tasks = [
      makeTask({ id: 'id-1', completed: false }),
      makeTask({ id: 'id-2', completed: false }),
    ];
    const state = makeState(tasks);
    const newState = toggleTask(state, 'id-1');
    expect(newState.tasks[0].completed).toBe(true);
    expect(newState.tasks[1].completed).toBe(false);
  });

  it('id tidak ditemukan — state tidak berubah', () => {
    const state = makeState([makeTask()]);
    const newState = toggleTask(state, 'id-tidak-ada');
    expect(newState.tasks[0].completed).toBe(false);
  });

  it('tidak memutasi state asli', () => {
    const task = makeTask();
    const state = makeState([task]);
    const original = JSON.stringify(state);
    toggleTask(state, 'test-id-1');
    expect(JSON.stringify(state)).toBe(original);
  });
});

// ─── deleteTask ─────────────────────────────────────────────────────────────

describe('deleteTask', () => {
  it('menghapus task dengan id yang sesuai', () => {
    const state = makeState([makeTask()]);
    const newState = deleteTask(state, 'test-id-1');
    expect(newState.tasks).toHaveLength(0);
  });

  it('hanya menghapus task yang ditarget', () => {
    const tasks = [
      makeTask({ id: 'id-1' }),
      makeTask({ id: 'id-2' }),
      makeTask({ id: 'id-3' }),
    ];
    const state = makeState(tasks);
    const newState = deleteTask(state, 'id-2');
    expect(newState.tasks).toHaveLength(2);
    expect(newState.tasks.find(t => t.id === 'id-2')).toBeUndefined();
    expect(newState.tasks.find(t => t.id === 'id-1')).toBeDefined();
    expect(newState.tasks.find(t => t.id === 'id-3')).toBeDefined();
  });

  it('id tidak ditemukan — jumlah task tidak berubah', () => {
    const state = makeState([makeTask()]);
    const newState = deleteTask(state, 'id-tidak-ada');
    expect(newState.tasks).toHaveLength(1);
  });

  it('tidak memutasi state asli', () => {
    const state = makeState([makeTask()]);
    const original = JSON.stringify(state);
    deleteTask(state, 'test-id-1');
    expect(JSON.stringify(state)).toBe(original);
  });
});

// ─── setFilter ──────────────────────────────────────────────────────────────

describe('setFilter', () => {
  it('mengubah filter ke "active"', () => {
    const state = makeState();
    expect(setFilter(state, 'active').filter).toBe('active');
  });

  it('mengubah filter ke "completed"', () => {
    const state = makeState();
    expect(setFilter(state, 'completed').filter).toBe('completed');
  });

  it('mengubah filter ke "all"', () => {
    const state = makeState([], 'active');
    expect(setFilter(state, 'all').filter).toBe('all');
  });

  it('tidak mengubah tasks saat filter berubah', () => {
    const tasks = [makeTask()];
    const state = makeState(tasks);
    const newState = setFilter(state, 'completed');
    expect(newState.tasks).toEqual(tasks);
  });
});

// ─── loadState / saveState ──────────────────────────────────────────────────

describe('loadState', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', (() => {
      let store = {};
      return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
      };
    })());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('localStorage kosong mengembalikan initialState', () => {
    expect(loadState()).toEqual(initialState);
  });

  it('filter default adalah "all" saat localStorage kosong', () => {
    // Requirements 5.5
    expect(loadState().filter).toBe('all');
  });

  it('JSON rusak mengembalikan initialState', () => {
    localStorage.setItem('todolist-app-state', 'bukan-json{{{');
    expect(loadState()).toEqual(initialState);
  });

  it('JSON valid tapi tasks bukan array mengembalikan initialState', () => {
    localStorage.setItem('todolist-app-state', JSON.stringify({ tasks: 'bukan array', filter: 'all' }));
    expect(loadState()).toEqual(initialState);
  });

  it('null di localStorage mengembalikan initialState', () => {
    // getItem returns null when key not set
    expect(loadState()).toEqual(initialState);
  });
});

describe('saveState + loadState round-trip', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', (() => {
      let store = {};
      return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
      };
    })());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('menyimpan dan memuat kembali state dengan benar', () => {
    const state = {
      tasks: [makeTask({ id: 'abc', text: 'Belajar', completed: true, createdAt: 123 })],
      filter: 'completed',
    };
    saveState(state);
    expect(loadState()).toEqual(state);
  });

  it('saveState tidak melempar error saat localStorage penuh (QuotaExceededError)', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => { throw new DOMException('QuotaExceededError'); },
      getItem: () => null,
    });
    expect(() => saveState(initialState)).not.toThrow();
  });
});
