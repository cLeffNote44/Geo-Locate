# CLAUDE.md — GeoChallenge

## Project Overview
Interactive geography quiz game — find countries on a D3/TopoJSON world map across 6 game modes with scoring, achievements, and spaced-repetition learning.

## Tech Stack
- React 19 + TypeScript (strict)
- Vite 8 (dev server + bundler)
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- D3.js (geo projections, zoom/pan)
- TopoJSON (world-50m.json atlas data)
- Web Audio API (procedural sound effects)
- localStorage (all persistence)

## Architecture
- **Screens**: `src/screens/` — MenuScreen, RegionSelectScreen, GameScreen, StatsScreen, ReviewScreen
- **State**: `src/state/gameReducer.ts` — useReducer-based game state with selectors in `selectors.ts`
- **Hooks**: `src/hooks/` — useGame (orchestrator), useAchievements, useSpacedRep, useSound, useWorldMap, useLeaderboard, useSpeedRunPB, useGameHistory
- **Data**: `src/data/` — countries, continents, regions, difficulty ratings
- **Lib**: `src/lib/` — scoring, achievements, sounds, storage, mapUtils, countryLookup, queue

## Key Patterns
- Game state flows through a reducer (`gameReducer.ts`), not Zustand — keeps it self-contained
- Spaced repetition uses SM-2 algorithm variant in `useSpacedRep.ts`
- D3 map in `ZoomMap.tsx` uses `useWorldMap` hook for projection + zoom behavior
- All sounds are synthesized via Web Audio API oscillators — zero audio assets
- `base: "./"` in vite.config.ts for relative asset paths (required for iframe embedding on leffel.io)

## Build & Run
```bash
npm install
npm run dev      # localhost:5173
npm run build    # outputs to dist/
npm run preview  # serves dist/ on :4173
```

## Embedding
Built output in `dist/` is copied to `leffel-dev/public/games/geo-challenge/` for iframe embedding on the portfolio site.
