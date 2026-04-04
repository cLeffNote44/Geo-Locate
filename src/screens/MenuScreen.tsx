import type { Screen } from "../types";
import type { HistoryEntry } from "../types";
import HistoryPanel from "../components/HistoryPanel";
import ModeGrid from "../components/ModeGrid";

interface MenuScreenProps {
  history: HistoryEntry[];
  navigate: (screen: Screen) => void;
}

export default function MenuScreen({ history, navigate }: MenuScreenProps) {
  return (
    <div
      className="min-h-dvh font-sans text-slate-200 flex flex-col items-center justify-center px-4 py-5"
      style={{
        background: "linear-gradient(160deg, #0a0f1e 0%, #0f1d35 50%, #111827 100%)",
      }}
    >
      <div className="mb-2 text-6xl">🌍</div>
      <h1 className="gradient-text text-[clamp(30px,6vw,56px)] font-black m-0 mb-2 text-center">
        GeoChallenge
      </h1>
      <p className="text-slate-500 text-[15px] mb-7 text-center max-w-[440px]">
        Test your geography knowledge — find countries on the map!
      </p>

      <ModeGrid navigate={navigate} />

      <button
        className="btn-ghost !mt-5 !text-xs"
        onClick={() => navigate({ kind: "stats" })}
      >
        📊 Statistics & Achievements
      </button>

      <HistoryPanel history={history} />
    </div>
  );
}
