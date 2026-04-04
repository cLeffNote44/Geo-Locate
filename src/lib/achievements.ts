import type { AchievementId } from "../types";
import type { GameSummary, RegionValue } from "../types";
import type { HistoryEntry, SpacedRepRecord, AchievementRecord } from "../types";
import { getMasteryLevel } from "./queue";

export interface AchievementDef {
  id: AchievementId;
  emoji: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_win", emoji: "🏆", name: "First Victory", description: "Win your first game" },
  { id: "perfect_game", emoji: "💎", name: "Flawless", description: "Complete a region with no mistakes" },
  { id: "world_conqueror", emoji: "🌍", name: "World Conqueror", description: "Win World mode" },
  { id: "speed_demon", emoji: "⚡", name: "Speed Demon", description: "Complete any region in under 60 seconds" },
  { id: "streak_5", emoji: "🔥", name: "On Fire", description: "Get a 5-country streak" },
  { id: "streak_10", emoji: "💥", name: "Unstoppable", description: "Get a 10-country streak" },
  { id: "africa_master", emoji: "🦁", name: "Africa Master", description: "Win Africa mode" },
  { id: "asia_master", emoji: "🐉", name: "Asia Master", description: "Win Asia mode" },
  { id: "europe_master", emoji: "🏰", name: "Europe Master", description: "Win Europe mode" },
  { id: "all_regions", emoji: "🗺️", name: "Globe Trotter", description: "Win a game in every region" },
  { id: "score_1000", emoji: "⭐", name: "Rising Star", description: "Score 1000+ in a single game" },
  { id: "score_5000", emoji: "🌟", name: "Superstar", description: "Score 5000+ in a single game" },
  { id: "practice_50", emoji: "📚", name: "Studious", description: "Complete 50 countries in practice mode" },
  { id: "mastered_20", emoji: "🧠", name: "Knowledge Base", description: "Master 20 countries (90%+ accuracy)" },
  { id: "dedicated", emoji: "🎮", name: "Dedicated Player", description: "Play 25 games total" },
  // v2.0 achievements
  { id: "streak_day_3", emoji: "🔥", name: "Three-Peat", description: "Play 3 days in a row" },
  { id: "streak_day_7", emoji: "🗓️", name: "Week Warrior", description: "Play 7 days in a row" },
  { id: "streak_day_30", emoji: "👑", name: "Monthly Master", description: "Play 30 days in a row" },
  { id: "daily_first", emoji: "📅", name: "Daily Devotee", description: "Complete your first daily challenge" },
  { id: "daily_perfect", emoji: "💯", name: "Daily Perfection", description: "Perfect score on a daily challenge" },
  { id: "hard_win", emoji: "💀", name: "Hardcore", description: "Win any game on Hard difficulty" },
  { id: "no_hints", emoji: "🧭", name: "Navigator", description: "Win 10 games without using hints" },
  { id: "speed_30", emoji: "⚡", name: "Lightning Round", description: "Complete any region in under 30 seconds" },
  { id: "score_10000", emoji: "🏅", name: "Legend", description: "Score 10,000+ in a single game" },
  { id: "americas_master", emoji: "🌎", name: "Americas Master", description: "Win both North & South America" },
];

const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export function getAchievementDef(id: AchievementId): AchievementDef | undefined {
  return ACHIEVEMENT_MAP.get(id);
}

export function checkAchievements(
  summary: GameSummary,
  history: HistoryEntry[],
  srRecords: Record<string, SpacedRepRecord>,
  currentAchievements: Record<AchievementId, AchievementRecord>,
  dayStreak?: number,
): AchievementId[] {
  const newlyUnlocked: AchievementId[] = [];

  function check(id: AchievementId, condition: boolean) {
    if (!currentAchievements[id]?.unlocked && condition) {
      newlyUnlocked.push(id);
    }
  }

  const { won, mode, region, score, maxStreak, totalTimeMs, correctCount, results, difficulty, hintsUsed } = summary;
  const totalSecs = Math.round(totalTimeMs / 1000);
  const allHistory = history;

  // Win-based
  check("first_win", won);
  check("perfect_game", won && results.every((r) => r.correct));
  check("world_conqueror", won && region === "world");
  check("africa_master", won && region === "africa");
  check("asia_master", won && region === "asia");
  check("europe_master", won && region === "europe");

  // Speed
  check("speed_demon", won && totalSecs < 60);
  check("speed_30", won && totalSecs < 30);

  // Streaks
  check("streak_5", maxStreak >= 5);
  check("streak_10", maxStreak >= 10);

  // Score
  check("score_1000", score >= 1000);
  check("score_5000", score >= 5000);
  check("score_10000", score >= 10000);

  // All regions
  const wonRegions = new Set<RegionValue>();
  for (const h of allHistory) {
    if (h.won) wonRegions.add(h.regionValue);
  }
  if (won) wonRegions.add(region);
  const allRegions: RegionValue[] = ["world", "northAmerica", "southAmerica", "europe", "africa", "asia", "oceania"];
  check("all_regions", allRegions.every((r) => wonRegions.has(r)));

  // Americas master
  check("americas_master", wonRegions.has("northAmerica") && wonRegions.has("southAmerica"));

  // Practice countries
  const practiceCorrect = allHistory
    .filter((h) => h.mode === "practice")
    .reduce((sum, h) => sum + h.found, 0);
  const currentPractice = mode === "practice" ? correctCount : 0;
  check("practice_50", practiceCorrect + currentPractice >= 50);

  // Mastered countries
  let masteredCount = 0;
  for (const rec of Object.values(srRecords)) {
    if (getMasteryLevel(rec) === "mastered") masteredCount++;
  }
  check("mastered_20", masteredCount >= 20);

  // Dedicated
  check("dedicated", allHistory.length >= 25);

  // v2.0 — Difficulty
  check("hard_win", won && difficulty === "hard");

  // v2.0 — No hints (10 games without hints)
  const noHintWins = allHistory.filter((h) => h.won && (h.hintsUsed ?? 0) === 0).length;
  const currentNoHint = won && hintsUsed === 0 ? 1 : 0;
  check("no_hints", noHintWins + currentNoHint >= 10);

  // v2.0 — Daily
  check("daily_first", mode === "daily");
  check("daily_perfect", mode === "daily" && won && results.every((r) => r.correct));

  // v2.0 — Day streaks (checked from external streak data)
  if (dayStreak !== undefined) {
    check("streak_day_3", dayStreak >= 3);
    check("streak_day_7", dayStreak >= 7);
    check("streak_day_30", dayStreak >= 30);
  }

  return newlyUnlocked;
}
