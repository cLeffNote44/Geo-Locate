# GeoChallenge

Interactive geography quiz game built with React, TypeScript, and D3. Test your knowledge of world geography across 6 game modes with scoring, achievements, and spaced repetition learning.

## Features

**6 Game Modes**
- **Classic** — 3 lives, find each country on the map
- **Practice** — No penalty, learn at your pace with country info panels
- **Timed** — 120-second countdown, wrong answers cost 5 seconds
- **Speed Run** — Find all countries as fast as possible, personal best tracking
- **Flags** — Identify countries by their flag emoji
- **Capitals** — Find countries by their capital city name

**7 World Regions** — World, North America, South America, Europe, Africa, Asia, Oceania

**Scoring System** — Base points + time bonus + streak multiplier (up to x3 at 10-streak)

**15 Achievements** — First Victory, Flawless, World Conqueror, Speed Demon, and more

**Per-Region Leaderboard** — Top 10 scores tracked locally

**Spaced Repetition** — Countries you struggle with appear more frequently

**Statistics Dashboard** — World mastery heat map, accuracy tracking, weakest countries

**Educational** — Country info panels with capital, population, area, languages, coordinates

**Sound Effects** — Programmatic Web Audio tones with mute toggle

**Mobile Responsive** — Touch-optimized with pinch-to-zoom support

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS v4**
- **D3** (map projections, zoom/pan)
- **TopoJSON** (world atlas data)
- **Web Audio API** (sound effects)
- **localStorage** (persistence)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

## Embedding

Add `?embed=true` to the URL to use in an iframe:

```html
<iframe src="https://your-domain.com/?embed=true" width="100%" height="600" frameborder="0"></iframe>
```

## License

MIT
