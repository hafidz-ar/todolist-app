// Property-based tests for todolist-app using fast-check
// Feature: todolist-app

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { addTask, toggleTask, deleteTask, setFilter, saveState, loadState, initialState } from '../app.js';

// ─── Arbitraries ────────────────────────────────────────────────────────────

const taskArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
});

const appStateArbitrary = fc.record({
  tasks: fc.array(taskArbitrary),
  filter: fc.constantFrom('all', 'active', 'completed'),
});

const validTextArbitrary = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter(s => s.trim().length > 0);

const whitespaceOnlyArbitrary = fc
  .array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 50 })
  .map(arr => arr.join(''));

const tooLongTextArbitrary = fc.string({ minLength: 201, maxLength: 400 });

// ─── Property 1: Penambahan task valid ──────────────────────────────────────

describe('todolist-app property tests', () => {
  // Feature: todolist-app, Property 1: Penambahan task yang valid selalu masuk ke list dengan status belum selesai
  // Validates: Requirements 1.2
  it('P1 — task valid ditambahkan ke list dengan completed=false', () => {
    fc.assert(
      fc.property(appStateArbitrary, validTextArbitrary, (state, text) => {
        const newState = addTask(state, text);
        const trimmed = text.trim();
        const added = newState.tasks.find(t => t.text === trimmed);
        expect(added).toBeDefined();
        expect(added.completed).toBe(false);
        expect(newState.tasks.length).toBe(state.tasks.length + 1);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: todolist-app, Property 2: Input whitespace-only dan teks terlalu panjang ditolak
  // Validates: Requirements 1.4, 1.5
  it('P2 — whitespace-only input ditolak, state tidak berubah', () => {
    fc.assert(
      fc.property(appStateArbitrary, whitespaceOnlyArbitrary, (state, text) => {
        const newState = addTask(state, text);
        expect(newState).toEqual(state);
      }),
      { numRuns: 100 }
    );
  });

  it('P2 — teks terlalu panjang (>200 karakter) ditolak, state tidak berubah', () => {
    fc.assert(
      fc.property(appStateArbitrary, tooLongTextArbitrary, (state, text) => {
        const newState = addTask(state, text);
        expect(newState).toEqual(state);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: todolist-app, Property 3: Toggle adalah involution (round-trip)
  // Validates: Requirements 3.1, 3.3
  it('P3 — toggleTask dua kali mengembalikan state semula', () => {
    fc.assert(
      fc.property(
        fc.record({
          tasks: fc.array(taskArbitrary, { minLength: 1 }),
          filter: fc.constantFrom('all', 'active', 'completed'),
        }),
        fc.integer({ min: 0 }).chain(n =>
          fc.record({
            tasks: fc.array(taskArbitrary, { minLength: 1 }),
            filter: fc.constantFrom('all', 'active', 'completed'),
          }).map(state => ({ state, idx: n % state.tasks.length }))
        ),
        (_unused, { state, idx }) => {
          const id = state.tasks[idx].id;
          const originalCompleted = state.tasks[idx].completed;
          const toggled = toggleTask(state, id);
          const toggledBack = toggleTask(toggled, id);
          // Round-trip: double toggle restores original
          expect(toggledBack.tasks[idx].completed).toBe(originalCompleted);
          // Single toggle flips the value
          expect(toggled.tasks[idx].completed).toBe(!originalCompleted);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: todolist-app, Property 4: Penghapusan task bersifat permanen dan tepat sasaran
  // Validates: Requirements 4.2
  it('P4 — deleteTask menghapus tepat satu task dan sisanya tetap ada', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0 }).chain(n =>
          fc.record({
            tasks: fc.array(taskArbitrary, { minLength: 1 }),
            filter: fc.constantFrom('all', 'active', 'completed'),
          }).map(state => ({ state, idx: n % state.tasks.length }))
        ),
        ({ state, idx }) => {
          const id = state.tasks[idx].id;
          const newState = deleteTask(state, id);
          // Task terhapus
          expect(newState.tasks.find(t => t.id === id)).toBeUndefined();
          // Panjang berkurang tepat 1
          expect(newState.tasks.length).toBe(state.tasks.length - 1);
          // Semua task lain masih ada
          state.tasks.forEach(t => {
            if (t.id !== id) {
              expect(newState.tasks.find(x => x.id === t.id)).toBeDefined();
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: todolist-app, Property 7: Persistensi data adalah round-trip yang lossless
  // Validates: Requirements 6.2
  it('P7 — saveState lalu loadState menghasilkan state yang ekuivalen', () => {
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        clear: () => { store = {}; },
      };
    })();

    vi.stubGlobal('localStorage', localStorageMock);

    fc.assert(
      fc.property(appStateArbitrary, (state) => {
        localStorageMock.clear();
        saveState(state);
        const loaded = loadState();
        expect(loaded).toEqual(state);
      }),
      { numRuns: 100 }
    );

    vi.unstubAllGlobals();
  });

  // Feature: todolist-app, Property 8: Data localStorage yang tidak valid menghasilkan state awal yang bersih
  // Validates: Requirements 6.3
  it('P8 — JSON tidak valid di localStorage mengembalikan initialState', () => {
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        clear: () => { store = {}; },
      };
    })();

    vi.stubGlobal('localStorage', localStorageMock);

    // Non-JSON strings
    fc.assert(
      fc.property(
        fc.string().filter(s => { try { JSON.parse(s); return false; } catch { return true; } }),
        (invalidJson) => {
          localStorageMock.clear();
          localStorageMock.setItem('todolist-app-state', invalidJson);
          const loaded = loadState();
          expect(loaded).toEqual(initialState);
        }
      ),
      { numRuns: 100 }
    );

    vi.unstubAllGlobals();
  });

  it('P8 — objek JSON tanpa tasks array mengembalikan initialState', () => {
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        clear: () => { store = {}; },
      };
    })();

    vi.stubGlobal('localStorage', localStorageMock);

    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer().map(n => JSON.stringify(n)),
          fc.string().map(s => JSON.stringify(s)),
          fc.constant('null'),
          fc.record({ foo: fc.string() }).map(o => JSON.stringify(o)),
          fc.record({ tasks: fc.string() }).map(o => JSON.stringify(o)), // tasks bukan array
        ),
        (invalidData) => {
          localStorageMock.clear();
          localStorageMock.setItem('todolist-app-state', invalidData);
          const loaded = loadState();
          expect(loaded).toEqual(initialState);
        }
      ),
      { numRuns: 100 }
    );

    vi.unstubAllGlobals();
  });
});
