import { useState, useCallback } from "react";
import type { LeaderboardEntry, RegionValue } from "../types";
import { load, save } from "../lib/storage";

const LB_KEY = "geo-leaders";
const MAX_PER_REGION = 10;
type LBData = Record<string, LeaderboardEntry[]>;

export function useLeaderboard() {
  const [data, setData] = useState<LBData>(() => load<LBData>(LB_KEY, {}));

  const addScore = useCallback((entry: LeaderboardEntry) => {
    setData((prev) => {
      const regionKey = entry.region;
      const list = [...(prev[regionKey] ?? []), entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_PER_REGION);
      const next = { ...prev, [regionKey]: list };
      save(LB_KEY, next);
      return next;
    });
  }, []);

  const getRegionScores = useCallback(
    (region: RegionValue): LeaderboardEntry[] => {
      return data[region] ?? [];
    },
    [data],
  );

  const getTopScore = useCallback(
    (region: RegionValue): number => {
      const list = data[region];
      return list?.[0]?.score ?? 0;
    },
    [data],
  );

  return { leaderboard: data, addScore, getRegionScores, getTopScore };
}
