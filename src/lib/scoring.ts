import type { RegionValue, RoundResult, Difficulty } from "../types";

const REGION_MULTIPLIER: Record<RegionValue, number> = {
  world: 2.0,
  africa: 1.5,
  asia: 1.5,
  europe: 1.3,
  northAmerica: 1.0,
  southAmerica: 1.0,
  oceania: 1.0,
};

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 0.75,
  normal: 1.0,
  hard: 1.5,
};

const TIME_BONUS_DECAY: Record<Difficulty, number> = {
  easy: 750,
  normal: 500,
  hard: 250,
};

function getStreakMultiplier(streak: number): number {
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

export function calculateRoundScore(
  timeMs: number,
  streak: number,
  difficulty: Difficulty = "normal",
): { base: number; timeBonus: number; streakMultiplier: number; total: number } {
  const base = 100;
  const decay = TIME_BONUS_DECAY[difficulty];
  const timeBonus = Math.max(0, 200 - Math.floor(timeMs / decay));
  const streakMultiplier = getStreakMultiplier(streak);
  const diffMultiplier = DIFFICULTY_MULTIPLIER[difficulty];
  const total = Math.round((base + timeBonus) * streakMultiplier * diffMultiplier);
  return { base, timeBonus, streakMultiplier, total };
}

export function calculateGameScore(
  results: RoundResult[],
  region: RegionValue,
  won: boolean,
  timeRemainingBonus?: number,
): { totalScore: number; maxStreak: number } {
  let totalScore = 0;
  let maxStreak = 0;
  let currentStreak = 0;

  for (const r of results) {
    totalScore += r.score;
    if (r.correct) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  // Win bonus
  if (won) {
    totalScore += Math.round(REGION_MULTIPLIER[region] * 500);
  }

  // Time remaining bonus (timed mode)
  if (timeRemainingBonus && timeRemainingBonus > 0) {
    totalScore += timeRemainingBonus * 10;
  }

  return { totalScore, maxStreak };
}

export function getRegionMultiplier(region: RegionValue): number {
  return REGION_MULTIPLIER[region];
}
