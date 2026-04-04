import type { CountryId, GameMode, RegionValue } from "./game";

export interface HistoryEntry {
  date: string;
  region: string;
  regionValue: RegionValue;
  mode: GameMode;
  found: number;
  total: number;
  livesLeft: number;
  won: boolean;
  secs: number;
  pct: number;
}

export interface SpacedRepRecord {
  countryId: CountryId;
  attempts: number;
  correct: number;
  lastSeen: number;
}

export type MasteryLevel = "new" | "learning" | "familiar" | "known" | "mastered";

export interface PlayerStats {
  totalGames: number;
  totalCorrect: number;
  totalAttempts: number;
  totalTimeSecs: number;
  countriesMastered: number;
  overallAccuracy: number;
}
