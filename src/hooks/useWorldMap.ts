import { useState, useEffect } from "react";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";

interface WorldMapResult {
  features: GeoJSON.Feature[];
  loading: boolean;
  error: string | null;
}

let cachedFeatures: GeoJSON.Feature[] | null = null;

export function useWorldMap(): WorldMapResult {
  const [features, setFeatures] = useState<GeoJSON.Feature[]>(
    cachedFeatures ?? [],
  );
  const [loading, setLoading] = useState(!cachedFeatures);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedFeatures) return;

    let cancelled = false;

    fetch("/world-50m.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((topo: Topology) => {
        if (cancelled) return;
        const collection = topojson.feature(
          topo,
          topo.objects.countries,
        ) as unknown as GeoJSON.FeatureCollection;

        // Normalize IDs to strings
        const feats = collection.features.map((f) => ({
          ...f,
          id: String(f.id),
        }));

        cachedFeatures = feats;
        setFeatures(feats);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { features, loading, error };
}
