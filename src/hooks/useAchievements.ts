import { useState, useCallback } from "react";
import type { AchievementId, AchievementRecord } from "../types";
import { load, save } from "../lib/storage";

const ACH_KEY = "geo-achievements";
type AchData = Record<string, AchievementRecord>;

export function useAchievements() {
  const [data, setData] = useState<AchData>(() => load<AchData>(ACH_KEY, {}));

  const unlock = useCallback((ids: AchievementId[]) => {
    if (ids.length === 0) return;
    setData((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        if (!next[id]?.unlocked) {
          next[id] = { unlocked: true, unlockedAt: Date.now() };
        }
      }
      save(ACH_KEY, next);
      return next;
    });
  }, []);

  const isUnlocked = useCallback(
    (id: AchievementId) => !!data[id]?.unlocked,
    [data],
  );

  return { achievements: data as Record<AchievementId, AchievementRecord>, unlock, isUnlocked };
}
