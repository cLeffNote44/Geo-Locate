import type { CountryId } from "../types";
import type { CountryInfo } from "../types";
import rawData from "../data/countryInfo.json";
import { NAMES } from "../data/countries";

const lookup = new Map<CountryId, CountryInfo>();
for (const entry of rawData as CountryInfo[]) {
  lookup.set(entry.id, entry);
}

export function getCountryInfo(id: CountryId): CountryInfo | undefined {
  return lookup.get(id);
}

export function getCountryName(id: CountryId): string {
  return NAMES[id] ?? lookup.get(id)?.name ?? "Unknown";
}

export function getAllCountryInfo(): CountryInfo[] {
  return rawData as CountryInfo[];
}
