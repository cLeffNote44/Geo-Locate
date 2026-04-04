import type { CountryId, RegionValue } from "../types";
import type { SpacedRepRecord } from "../types";
import { DIFFICULTY } from "../data/difficulty";

/**
 * Build the question queue for a region, optionally weighted by spaced rep data.
 * Countries with lower accuracy are pushed toward the front.
 */
export function buildQueue(
  region: RegionValue,
  availableIds: Set<CountryId>,
  srRecords?: Record<CountryId, SpacedRepRecord>,
): CountryId[] {
  // Start with difficulty ordering, filtered to available map features
  const base = DIFFICULTY[region].filter((id) => availableIds.has(id));

  if (!srRecords || Object.keys(srRecords).length === 0) {
    return base;
  }

  // Partition into mastery buckets
  const weak: CountryId[] = [];
  const medium: CountryId[] = [];
  const strong: CountryId[] = [];

  for (const id of base) {
    const rec = srRecords[id];
    if (!rec || rec.attempts === 0) {
      medium.push(id); // unseen — treat as medium
      continue;
    }
    const accuracy = rec.correct / rec.attempts;
    if (accuracy < 0.4) {
      weak.push(id);
    } else if (accuracy < 0.7) {
      medium.push(id);
    } else {
      strong.push(id);
    }
  }

  // Weak first, then medium, then strong
  return [...weak, ...medium, ...strong];
}

export function getMasteryLevel(
  rec: SpacedRepRecord | undefined,
): "new" | "learning" | "familiar" | "known" | "mastered" {
  if (!rec || rec.attempts === 0) return "new";
  const acc = rec.correct / rec.attempts;
  if (acc < 0.4) return "learning";
  if (acc < 0.7) return "familiar";
  if (acc < 0.9) return "known";
  return "mastered";
}
