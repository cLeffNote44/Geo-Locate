import type { RegionValue } from "../types";

export interface RegionOption {
  id: RegionValue | "antarctica";
  label: string;
  emoji: string;
}

export const REGION_OPTIONS: RegionOption[] = [
  { id: "world", label: "World", emoji: "🌍" },
  { id: "northAmerica", label: "North America", emoji: "🌎" },
  { id: "southAmerica", label: "South America", emoji: "🌎" },
  { id: "europe", label: "Europe", emoji: "🌍" },
  { id: "africa", label: "Africa", emoji: "🌍" },
  { id: "asia", label: "Asia", emoji: "🌏" },
  { id: "oceania", label: "Oceania", emoji: "🌏" },
  { id: "antarctica", label: "Antarctica", emoji: "❄️" },
];

export function getRegionLabel(value: RegionValue): string {
  return REGION_OPTIONS.find((r) => r.id === value)?.label ?? value;
}
