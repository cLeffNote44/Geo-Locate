import type { Screen } from "../types";
import type { HistoryEntry } from "../types";
import HistoryPanel from "../components/HistoryPanel";
import ModeGrid from "../components/ModeGrid";

interface MenuScreenProps {
  history: HistoryEntry[];
  currentStreak: number;
  longestStreak: number;
  navigate: (screen: Screen) => void;
}

export default function MenuScreen({ history, currentStreak, longestStreak, navigate }: MenuScreenProps) {
  return (
    <div
      className="min-h-dvh font-sans text-slate-200 flex flex-col items-center justify-center px-4 py-5"
      style={{
        background: "linear-gradient(160deg, #0a0f1e 0%, #0f1d35 50%, #111827 100%)",
      }}
    >
      {/* Settings gear - top right */}
      <button
        onClick={() => navigate({ kind: "settings" })}
        className="fixed top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl bg-white/[.06] border border-white/10 text-slate-400 hover:text-white hover:bg-white/[.1] transition-colors cursor-pointer z-10"
        title="Settings"
      >
        ⚙️
      </button>

      <div className="mb-2 text-6xl">🌍</div>
      <h1 className="gradient-text text-[clamp(30px,6vw,56px)] font-black m-0 mb-2 text-center">
        GeoChallenge
      </h1>
      <p className="text-slate-500 text-[15px] mb-3 text-center max-w-[440px]">
        Test your geography knowledge — find countries on the map!
      </p>

      {/* Streak display */}
      {currentStreak > 0 && (
        <div className="flex items-center gap-2 mb-5 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25">
          <span className="text-lg">
            {currentStreak >= 7 ? "🔥🔥🔥" : currentStreak >= 3 ? "🔥🔥" : "🔥"}
          </span>
          <span className="text-sm font-bold text-amber-400">
            {currentStreak} day streak
          </span>
          {longestStreak > currentStreak && (
            <span className="text-xs text-slate-500">
              (best: {longestStreak})
            </span>
          )}
        </div>
      )}

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
