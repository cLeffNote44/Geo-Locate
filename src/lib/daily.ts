import type { CountryId } from "../types";
import { load, save } from "./storage";
import { DIFFICULTY } from "../data/difficulty";

const DAILY_KEY = "geo-daily";
const DAILY_COUNT = 10;

interface DailyResult {
  date: string;
  score: number;
  correct: number;
  total: number;
  won: boolean;
  pct: number;
}

interface DailyData {
  results: Record<string, DailyResult>;
  streak: number;
  lastPlayedDate: string;
}

function getDailyData(): DailyData {
  return load<DailyData>(DAILY_KEY, {
    results: {},
    streak: 0,
    lastPlayedDate: "",
  });
}

function saveDailyData(data: DailyData): void {
  save(DAILY_KEY, data);
}

/** Deterministic hash from a date string to a seed number */
function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/** Seeded random number generator (Mulberry32) */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle with seeded RNG */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  const rng = mulberry32(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getTodayKey(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

export function getDailyNumber(): number {
  const epoch = new Date("2026-04-01").getTime();
  const now = new Date(getTodayKey()).getTime();
  return Math.floor((now - epoch) / (24 * 60 * 60 * 1000)) + 1;
}

export function getDailyQueue(): CountryId[] {
  const today = getTodayKey();
  const seed = hashDate(today);
  const worldCountries = DIFFICULTY.world;
  const shuffled = seededShuffle(worldCountries, seed);
  return shuffled.slice(0, DAILY_COUNT);
}

export function hasPlayedToday(): boolean {
  const data = getDailyData();
  return data.results[getTodayKey()] !== undefined;
}

export function getTodayResult(): DailyResult | null {
  const data = getDailyData();
  return data.results[getTodayKey()] ?? null;
}

export function saveDailyResult(result: Omit<DailyResult, "date">): void {
  const today = getTodayKey();
  const data = getDailyData();

  data.results[today] = { ...result, date: today };

  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split("T")[0];

  if (data.lastPlayedDate === yesterdayKey) {
    data.streak += 1;
  } else if (data.lastPlayedDate !== today) {
    data.streak = 1;
  }
  data.lastPlayedDate = today;

  saveDailyData(data);
}

export function getDailyStreak(): number {
  const data = getDailyData();
  const today = getTodayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split("T")[0];

  // Streak is only valid if played today or yesterday
  if (data.lastPlayedDate === today || data.lastPlayedDate === yesterdayKey) {
    return data.streak;
  }
  return 0;
}

export function getDailyHistory(): DailyResult[] {
  const data = getDailyData();
  return Object.values(data.results).sort((a, b) => b.date.localeCompare(a.date));
}

export function getTimeUntilNextDaily(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}
