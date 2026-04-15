# Project Structure

```
todolist-app/
├── index.html              # Entry point and HTML structure
├── style.css               # Styles including .completed class for strikethrough
├── app.js                  # All app logic (Model + View + Controller)
├── package.json            # Dev dependencies only (vitest, fast-check)
└── tests/
    ├── unit.test.js        # Example-based tests for specific/edge cases
    └── property.test.js    # Property-based tests using fast-check
```

## app.js Organization

All JS lives in `app.js`, grouped by responsibility with comments:

- **Model** — pure functions for state mutations + localStorage persistence
  - `addTask`, `toggleTask`, `deleteTask`, `setFilter`
  - `saveState`, `loadState`
- **View** — DOM rendering functions
  - `render`, `renderTaskList`, `renderSummary`, `renderFilters`, `getFilteredTasks`
- **Controller** — event handlers + app init
  - `handleAddTask`, `handleToggleTask`, `handleDeleteTask`, `handleFilterChange`, `init`

## Key Conventions

- All Model functions are **pure functions** — take state + params, return new state, no direct mutation
- Single source of truth: `AppState` object `{ tasks: Task[], filter: string }`
- Data flow is **unidirectional**: User → Controller → Model → View
- `init()` is called on `DOMContentLoaded`
- Task IDs use format: `"${Date.now()}-${Math.random().toString(36).slice(2, 7)}"`
- localStorage key: `'todolist-app-state'`
- Filter values: `'all'` | `'active'` | `'completed'`

## Property Test Tagging

Each property test must include a tag comment:
```js
// Feature: todolist-app, Property {N}: {short description}
```
