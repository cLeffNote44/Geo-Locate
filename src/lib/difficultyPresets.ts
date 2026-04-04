import type { Difficulty } from "../types";
import { load, save } from "./storage";

export interface DifficultyPreset {
  label: string;
  emoji: string;
  lives: number;
  timedDuration: number;
  scoreMultiplier: number;
  hintsEnabled: boolean;
  freeFirstHint: boolean;
  description: string;
}

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyPreset> = {
  easy: {
    label: "Easy",
    emoji: "🟢",
    lives: 5,
    timedDuration: 180,
    scoreMultiplier: 0.75,
    hintsEnabled: true,
    freeFirstHint: true,
    description: "5 lives, 180s timer, free first hint",
  },
  normal: {
    label: "Normal",
    emoji: "🟡",
    lives: 3,
    timedDuration: 120,
    scoreMultiplier: 1.0,
    hintsEnabled: true,
    freeFirstHint: false,
    description: "3 lives, 120s timer",
  },
  hard: {
    label: "Hard",
    emoji: "🔴",
    lives: 1,
    timedDuration: 60,
    scoreMultiplier: 1.5,
    hintsEnabled: false,
    freeFirstHint: false,
    description: "1 life, 60s timer, no hints, 1.5x score",
  },
};

const DIFFICULTY_KEY = "geo-difficulty";

export function getDefaultDifficulty(): Difficulty {
  return load<Difficulty>(DIFFICULTY_KEY, "normal");
}

export function setDefaultDifficulty(d: Difficulty): void {
  save(DIFFICULTY_KEY, d);
}

export function getLivesForDifficulty(difficulty: Difficulty, mode: string): number {
  if (mode === "practice" || mode === "speedrun" || mode === "timed") return Infinity;
  return DIFFICULTY_PRESETS[difficulty].lives;
}

export function getTimedDuration(difficulty: Difficulty): number {
  return DIFFICULTY_PRESETS[difficulty].timedDuration;
}
