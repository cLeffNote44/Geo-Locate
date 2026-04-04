export type CountryId = string;
export type GameMode = "classic" | "practice";
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
}

export interface GameState {
  mode: GameMode;
  region: RegionValue;
  queue: CountryId[];
  currentIndex: number;
  lives: number;
  results: RoundResult[];
  flash: { type: "correct" | "wrong" } | null;
  wrongClickId: CountryId | null;
  answerRevealed: boolean;
  finished: boolean;
  startedAt: number;
  roundStartedAt: number;
}

export type GameAction =
  | {
      type: "INIT_GAME";
      mode: GameMode;
      region: RegionValue;
      queue: CountryId[];
      lives?: number;
    }
  | { type: "CLICK_COUNTRY"; countryId: CountryId; timestamp: number }
  | { type: "REVEAL_ANSWER" }
  | { type: "NEXT_COUNTRY" }
  | { type: "CLEAR_FLASH" }
  | { type: "CLEAR_WRONG_HIGHLIGHT" }
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
}

export interface MapFeature {
  id: CountryId;
  name: string | null;
  d: string;
}
