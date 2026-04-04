import type { GameState, CountryId, GameSummary, RegionValue } from "../types";

export function currentCountryId(state: GameState): CountryId | null {
  if (state.currentIndex >= state.queue.length) return null;
  return state.queue[state.currentIndex];
}

export function progress(state: GameState): number {
  if (state.queue.length === 0) return 0;
  return state.currentIndex / state.queue.length;
}

export function correctSet(state: GameState): Set<CountryId> {
  const s = new Set<CountryId>();
  for (const r of state.results) {
    if (r.correct) s.add(r.countryId);
  }
  return s;
}

export function wrongSet(state: GameState): Set<CountryId> {
  const s = new Set<CountryId>();
  for (const r of state.results) {
    if (!r.correct) s.add(r.countryId);
  }
  return s;
}

export function correctCount(state: GameState): number {
  return state.results.filter((r) => r.correct).length;
}

export function buildSummary(
  state: GameState,
  region: RegionValue,
): GameSummary {
  const cc = correctCount(state);
  return {
    mode: state.mode,
    region,
    difficulty: state.difficulty,
    results: state.results,
    totalCountries: state.queue.length,
    correctCount: cc,
    livesLeft: state.lives === Infinity ? 0 : state.lives,
    won: cc >= state.queue.length,
    totalTimeMs: Date.now() - state.startedAt,
    score: state.score,
    maxStreak: state.maxStreak,
    hintsUsed: state.hintsUsed,
  };
}
