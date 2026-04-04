import { useState, useCallback } from "react";
import type { RegionValue } from "../types";
import { load, save } from "../lib/storage";

const PB_KEY = "geo-speedrun-pb";
type PBData = Record<string, number>; // region → best time in seconds

export function useSpeedRunPB() {
  const [data, setData] = useState<PBData>(() => load<PBData>(PB_KEY, {}));

  const getPB = useCallback(
    (region: RegionValue): number | null => {
      return data[region] ?? null;
    },
    [data],
  );

  const updatePB = useCallback(
    (region: RegionValue, secs: number): boolean => {
      const current = data[region];
      if (current !== undefined && current <= secs) return false; // not a PB
      setData((prev) => {
        const next = { ...prev, [region]: secs };
        save(PB_KEY, next);
        return next;
      });
      return true;
    },
    [data],
  );

  return { getPB, updatePB, allPBs: data };
}
