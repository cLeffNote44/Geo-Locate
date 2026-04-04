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
  score: number;
  maxStreak: number;
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

export interface LeaderboardEntry {
  score: number;
  date: string;
  mode: GameMode;
  region: RegionValue;
  pct: number;
}

export type AchievementId =
  | "first_win"
  | "perfect_game"
  | "world_conqueror"
  | "speed_demon"
  | "streak_5"
  | "streak_10"
  | "africa_master"
  | "asia_master"
  | "europe_master"
  | "all_regions"
  | "score_1000"
  | "score_5000"
  | "practice_50"
  | "mastered_20"
  | "dedicated";

export interface AchievementRecord {
  unlocked: boolean;
  unlockedAt: number;
}
