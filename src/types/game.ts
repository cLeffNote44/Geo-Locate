export type CountryId = string;
export type GameMode = "classic" | "practice" | "timed" | "flags" | "capitals" | "speedrun";
export type RegionValue =
  | "world"
  | "northAmerica"
  | "southAmerica"
  | "europe"
  | "africa"
  | "asia"
  | "oceania";

export interface RoundResult {
  countryId: CountryId;
  correct: boolean;
  timeMs: number;
  score: number;
}

export interface GameState {
  mode: GameMode;
  region: RegionValue;
  queue: CountryId[];
  currentIndex: number;
  lives: number;
  results: RoundResult[];
  flash: { type: "correct" | "wrong"; score?: number; streak?: number } | null;
  wrongClickId: CountryId | null;
  answerRevealed: boolean;
  finished: boolean;
  startedAt: number;
  roundStartedAt: number;
  // Scoring
  score: number;
  streak: number;
  maxStreak: number;
  // Timer (timed mode)
  timeLimit: number | null;
  timeRemaining: number;
  timePenalty: number;
}

export type GameAction =
  | {
      type: "INIT_GAME";
      mode: GameMode;
      region: RegionValue;
      queue: CountryId[];
      lives?: number;
      timeLimit?: number;
    }
  | { type: "CLICK_COUNTRY"; countryId: CountryId; timestamp: number }
  | { type: "REVEAL_ANSWER" }
  | { type: "NEXT_COUNTRY" }
  | { type: "CLEAR_FLASH" }
  | { type: "CLEAR_WRONG_HIGHLIGHT" }
  | { type: "TICK_TIMER" }
  | { type: "TIME_EXPIRED" }
  | { type: "QUIT" };

export type Screen =
  | { kind: "menu" }
  | { kind: "regionSelect"; mode: GameMode }
  | { kind: "game"; mode: GameMode; region: RegionValue }
  | { kind: "review"; summary: GameSummary }
  | { kind: "stats" };

export interface GameSummary {
  mode: GameMode;
  region: RegionValue;
  results: RoundResult[];
  totalCountries: number;
  correctCount: number;
  livesLeft: number;
  won: boolean;
  totalTimeMs: number;
  score: number;
  maxStreak: number;
}

export interface MapFeature {
  id: CountryId;
  name: string | null;
  d: string;
}
