import type { CountryId } from "./game";

export interface CountryInfo {
  id: CountryId;
  name: string;
  capital: string;
  population: number;
  area_km2: number;
  languages: string[];
  continent: string;
  flag_emoji: string;
  lat: number;
  lng: number;
}
