import { useState, useCallback } from "react";
import { load, save } from "../lib/storage";

const STREAK_KEY = "geo-streak";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string;
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function loadStreak(): StreakData {
  return load<StreakData>(STREAK_KEY, {
    currentStreak: 0,
    longestStreak: 0,
    lastPlayDate: "",
  });
}

export function useStreak() {
  const [data, setData] = useState<StreakData>(loadStreak);

  const currentStreak = (() => {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    if (data.lastPlayDate === today || data.lastPlayDate === yesterday) {
      return data.currentStreak;
    }
    return 0;
  })();

  const recordPlay = useCallback(() => {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();

    setData((prev) => {
      if (prev.lastPlayDate === today) return prev; // Already recorded today

      let newStreak: number;
      if (prev.lastPlayDate === yesterday) {
        newStreak = prev.currentStreak + 1;
      } else {
        newStreak = 1;
      }

      const updated: StreakData = {
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastPlayDate: today,
      };
      save(STREAK_KEY, updated);
      return updated;
    });
  }, []);

  return {
    currentStreak,
    longestStreak: data.longestStreak,
    playedToday: data.lastPlayDate === getTodayKey(),
    recordPlay,
  };
}
