export type CountryId = string;
export type GameMode = "classic" | "practice" | "timed" | "flags" | "capitals" | "speedrun" | "daily";
export type RegionValue =
  | "world"
  | "northAmerica"
  | "southAmerica"
  | "europe"
  | "africa"
  | "asia"
  | "oceania";

export type Difficulty = "easy" | "normal" | "hard";

export type HintLevel = "none" | "region" | "neighbors" | "reveal";

export interface RoundResult {
  countryId: CountryId;
  correct: boolean;
  timeMs: number;
  score: number;
}

export interface GameState {
  mode: GameMode;
  region: RegionValue;
  difficulty: Difficulty;
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
  // Hints
  hintLevel: HintLevel;
  hintsUsed: number;
  highlightedIds: CountryId[];
}

export type GameAction =
  | {
      type: "INIT_GAME";
      mode: GameMode;
      region: RegionValue;
      difficulty: Difficulty;
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
  | { type: "USE_HINT"; level: HintLevel; cost: number; highlightIds?: CountryId[] }
  | { type: "QUIT" };

export type Screen =
  | { kind: "menu" }
  | { kind: "regionSelect"; mode: GameMode }
  | { kind: "game"; mode: GameMode; region: RegionValue; difficulty: Difficulty }
  | { kind: "review"; summary: GameSummary }
  | { kind: "stats" }
  | { kind: "settings" }
  | { kind: "daily" };

export interface GameSummary {
  mode: GameMode;
  region: RegionValue;
  difficulty: Difficulty;
  results: RoundResult[];
  totalCountries: number;
  correctCount: number;
  livesLeft: number;
  won: boolean;
  totalTimeMs: number;
  score: number;
  maxStreak: number;
  hintsUsed: number;
}

export interface MapFeature {
  id: CountryId;
  name: string | null;
  d: string;
}
