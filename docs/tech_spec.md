# The Nexus Chronicles — Technical Specification

## Architecture
Three-layer separation with one-way dependencies:
**UI Layer** → **Store Layer** → **Service Layer**

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.9 |
| UI | React 19 |
| State | MobX + mobx-react-lite |
| Build | Vite 7 |
| Persistence | IndexedDB + localStorage fallback |
| Styling | CSS custom properties + modules |

## Data Model

### Galaxy
- 30+ star systems with coordinates, types, factions
- Connections form a navigable graph
- Procedural characteristics, hand-crafted lore

### Economy
- 12 commodity types across 4 categories
- Dynamic pricing: base price × system modifier × supply/demand × event modifier
- NPC traders affect supply/demand over time

### Combat
- Turn-based: player chooses action each round
- Ship systems: weapons, shields, engines, special
- Power allocation mechanic
- Enemy AI with varied strategies

### Story
- 5 main chapters with branching choices
- Side quests tied to factions and systems
- Consequences affect faction reputation, available options, endings

### Persistence
- Auto-save on key actions
- Manual save slots
- IndexedDB for full game state
- localStorage fallback for smaller saves

## File Structure
```
src/
  core/types.ts          — All type definitions
  data/                  — Game content (systems, commodities, story)
  services/              — Stateless game logic
  stores/                — MobX observable state
  ui/components/         — Reusable UI pieces
  ui/screens/            — Game screens
  ui/styles/             — Theme and animations
```
