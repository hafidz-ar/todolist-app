# Tech Stack

## Core
- **Vanilla JS (ES6 modules)** — no frameworks, no build tools
- **HTML5 / CSS3** — static files, zero external dependencies
- **localStorage** — client-side persistence

## Testing
- **Vitest** — test runner
- **fast-check** — property-based testing library (minimum 100 iterations per property)

## Common Commands

```bash
# Install dev dependencies
npm install --save-dev fast-check vitest

# Run all tests (single run, no watch mode)
npx vitest --run
```

## Notes
- No bundler or transpiler — files are served directly as static assets
- `package.json` only contains `devDependencies` for testing tools
- No runtime npm dependencies
