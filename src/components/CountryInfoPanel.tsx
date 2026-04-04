import { getCountryInfo } from "../lib/countryLookup";
import type { CountryId } from "../types";

interface CountryInfoPanelProps {
  countryId: CountryId | null;
  onClose: () => void;
}

function formatPopulation(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatArea(n: number): string {
  return n.toLocaleString() + " km²";
}

export default function CountryInfoPanel({
  countryId,
  onClose,
}: CountryInfoPanelProps) {
  if (!countryId) return null;
  const info = getCountryInfo(countryId);
  if (!info) return null;

  return (
    <div
      className="absolute top-0 right-0 h-full w-80 bg-gray-900/95 border-l border-white/10 backdrop-blur-xl z-40 overflow-y-auto"
      style={{ animation: "slide-in-right .3s ease" }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <span className="text-5xl">{info.flag_emoji}</span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-xl cursor-pointer bg-transparent border-none"
          >
            ✕
          </button>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{info.name}</h3>
        <p className="text-sm text-slate-400 mb-5">{info.continent}</p>

        <div className="space-y-3">
          <InfoRow label="Capital" value={info.capital} />
          <InfoRow label="Population" value={formatPopulation(info.population)} />
          <InfoRow label="Area" value={formatArea(info.area_km2)} />
          <InfoRow
            label="Languages"
            value={info.languages.join(", ")}
          />
          <InfoRow
            label="Coordinates"
            value={`${info.lat.toFixed(1)}°, ${info.lng.toFixed(1)}°`}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-2 border-b border-white/[.06]">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-200 text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}
