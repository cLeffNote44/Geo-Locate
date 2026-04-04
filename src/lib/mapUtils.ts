import * as d3 from "d3";
import type { GeoPermissibleObjects } from "d3";
import type { RegionValue, MapFeature, CountryId } from "../types";
import { NAMES } from "../data/countries";

const MAP_WIDTH = 800;
const MAP_HEIGHT = 490;
const PADDING = 12;

export function getProjection(
  region: RegionValue,
  geoCollection: GeoPermissibleObjects,
): d3.GeoProjection {
  const proj =
    region === "world" ? d3.geoNaturalEarth1() : d3.geoMercator();

  proj.fitExtent(
    [
      [PADDING, PADDING],
      [MAP_WIDTH - PADDING, MAP_HEIGHT - PADDING],
    ],
    geoCollection,
  );

  return proj;
}

export function buildMapFeatures(
  features: GeoJSON.Feature[],
  projection: d3.GeoProjection,
): MapFeature[] {
  const pathGen = d3.geoPath(projection);

  const result: MapFeature[] = [];
  for (const f of features) {
    const id = String(f.id) as CountryId;
    const d = pathGen(f);
    if (!d) continue;
    result.push({ id, name: NAMES[id] ?? null, d });
  }
  return result;
}

export { MAP_WIDTH, MAP_HEIGHT };
