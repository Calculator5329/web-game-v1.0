# AGENTS.md

## Cursor Cloud specific instructions

This is a **Vite + React + TypeScript** single-page application (`web-game-v1.0`). There are no backend services, databases, or Docker containers.

### Available commands

See `package.json` scripts:
- `npm run dev` — Vite dev server (default port 5173)
- `npm run build` — TypeScript type-check + production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build

### Running the dev server

Start with `npm run dev -- --host 0.0.0.0 --port 5173` to bind to all interfaces (needed for browser access in cloud VM). The app loads at `http://localhost:5173/`.

### Notes

- No environment variables or secrets are required.
- No automated test framework is configured yet; lint and build are the primary verification commands.
