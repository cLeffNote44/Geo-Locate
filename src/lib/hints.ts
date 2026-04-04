import type { CountryId, HintLevel, Difficulty } from "../types";
import { CONTINENTS } from "../data/continents";
import type { RegionValue } from "../types";

export interface HintOption {
  level: HintLevel;
  label: string;
  emoji: string;
  cost: number;
  description: string;
}

export const HINT_OPTIONS: HintOption[] = [
  { level: "region", label: "Show Region", emoji: "🌍", cost: 50, description: "Highlights the continent" },
  { level: "neighbors", label: "Show Neighbors", emoji: "🏘️", cost: 100, description: "Outlines bordering countries" },
  { level: "reveal", label: "Reveal Answer", emoji: "👁", cost: 200, description: "Shows the correct country" },
];

// Mapping of country IDs to their continent/region
const COUNTRY_REGIONS: Record<string, RegionValue[]> = {};
for (const [region, ids] of Object.entries(CONTINENTS)) {
  for (const id of ids) {
    if (!COUNTRY_REGIONS[id]) COUNTRY_REGIONS[id] = [];
    COUNTRY_REGIONS[id].push(region as RegionValue);
  }
}

// Neighboring countries (major borders only — top 80 countries)
const NEIGHBORS: Record<string, string[]> = {
  // North America
  "840": ["124", "484"], // USA → Canada, Mexico
  "124": ["840"], // Canada → USA
  "484": ["840", "320"], // Mexico → USA, Guatemala
  // Europe
  "250": ["276", "380", "724", "56", "756", "826"], // France → Germany, Italy, Spain, Belgium, Switzerland, UK
  "276": ["250", "616", "203", "40", "756", "528", "56"], // Germany → France, Poland, Czech, Austria, Switz, Neth, Belgium
  "380": ["250", "40", "756"], // Italy → France, Austria, Switzerland
  "724": ["250", "620"], // Spain → France, Portugal
  "826": ["372"], // UK → Ireland
  "643": ["804", "112", "246", "578", "233", "428", "440", "616"], // Russia → Ukraine, Belarus, Finland, Norway, Estonia, Latvia, Lithuania, Poland
  "616": ["276", "203", "703", "804", "112", "440", "428", "643"], // Poland
  // Asia
  "156": ["643", "356", "104", "418", "704", "408", "496", "586", "398", "417", "762"], // China
  "356": ["156", "586", "50", "104", "524", "144", "4"], // India
  "392": [], // Japan (island)
  // South America
  "76": ["32", "858", "600", "68", "604", "170", "862", "328", "740"], // Brazil
  "32": ["76", "152", "68", "600", "858"], // Argentina
  // Africa
  "818": ["434", "729", "376"], // Egypt → Libya, Sudan, Israel
  "710": ["508", "716", "72", "516", "426", "748"], // South Africa
  "566": ["120", "148", "562", "204"], // Nigeria
};

export function getHintCost(level: HintLevel, difficulty: Difficulty, hintLevel: HintLevel): number {
  if (difficulty === "easy" && hintLevel === "none") return 0; // Free first hint on easy
  const option = HINT_OPTIONS.find((h) => h.level === level);
  return option?.cost ?? 0;
}

export function getRegionHighlight(countryId: CountryId): CountryId[] {
  const regions = COUNTRY_REGIONS[countryId];
  if (!regions || regions.length === 0) return [];

  // Get all countries in the same region
  const regionKey = regions[0];
  if (regionKey === "world" || !(regionKey in CONTINENTS)) return [];
  const regionSet = CONTINENTS[regionKey as Exclude<RegionValue, "world">];
  if (!regionSet) return [];
  return Array.from(regionSet);
}

export function getNeighborHighlight(countryId: CountryId): CountryId[] {
  return NEIGHBORS[countryId] ?? [];
}

export function canUseHints(mode: string, difficulty: Difficulty): boolean {
  if (mode === "practice" || mode === "speedrun") return false;
  if (difficulty === "hard") return false;
  return true;
}

export function getNextHintLevel(current: HintLevel): HintLevel | null {
  switch (current) {
    case "none": return "region";
    case "region": return "neighbors";
    case "neighbors": return "reveal";
    case "reveal": return null;
  }
}
