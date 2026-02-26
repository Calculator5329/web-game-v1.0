# AGENTS.md

## Cursor Cloud specific instructions

This is **The Nexus Chronicles**, a sci-fi exploration RPG built with **Vite + React + TypeScript + MobX**. Single-page app, no backend services or databases required. Game state persists via IndexedDB (with localStorage fallback).

### Available commands

See `package.json` scripts:
- `npm run dev` — Vite dev server (default port 5173)
- `npm run build` — TypeScript type-check + production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build

### Running the dev server

Start with `npm run dev -- --host 0.0.0.0 --port 5173` to bind to all interfaces (needed for browser access in cloud VM). The app loads at `http://localhost:5173/`.

### Architecture

Three-layer separation: **UI → Store → Service** (see `docs/tech_spec.md`).
- `src/core/types.ts` — All type definitions (uses `as const` objects, not enums, due to `erasableSyntaxOnly` in tsconfig)
- `src/data/` — Game content (star systems, commodities, factions, story)
- `src/services/` — Stateless game logic
- `src/stores/` — MobX observable state
- `src/ui/` — React components and screens

### Notes

- No environment variables or secrets are required.
- No automated test framework is configured; lint + build are the primary CI checks.
- TypeScript uses `erasableSyntaxOnly`, so do NOT use runtime enums — use `as const` objects instead.
