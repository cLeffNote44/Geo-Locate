import type { GameMode, Screen } from "../types";
import type { HistoryEntry } from "../types";
import HistoryPanel from "../components/HistoryPanel";

interface MenuScreenProps {
  history: HistoryEntry[];
  navigate: (screen: Screen) => void;
}

export default function MenuScreen({ history, navigate }: MenuScreenProps) {
  const startGame = (mode: GameMode) => {
    navigate({ kind: "regionSelect", mode });
  };

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

      <div className="flex gap-3 flex-wrap justify-center mb-2">
        <button
          className="btn-primary"
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onClick={() => startGame("classic")}
        >
          🎯 Classic Mode
        </button>
        <button
          className="btn-ghost !px-7 !py-3.5 !text-base !font-bold"
          onClick={() => startGame("practice")}
        >
          📚 Practice Mode
        </button>
      </div>

      <button
        className="btn-ghost !mt-3 !text-xs"
        onClick={() => navigate({ kind: "stats" })}
      >
        📊 Statistics
      </button>

      <HistoryPanel history={history} />
    </div>
  );
}
