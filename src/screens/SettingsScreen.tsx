import { useState, useCallback } from "react";
import type { Screen, Difficulty } from "../types";
import { DIFFICULTY_PRESETS, getDefaultDifficulty, setDefaultDifficulty } from "../lib/difficultyPresets";
import ConfirmModal from "../components/ConfirmModal";

interface SettingsScreenProps {
  navigate: (screen: Screen) => void;
  muted: boolean;
  volume: number;
  onToggleMute: () => void;
  onSetVolume: (v: number) => void;
  onResetProgress: () => void;
  onReplayTutorial: () => void;
}

export default function SettingsScreen({
  navigate,
  muted,
  volume,
  onToggleMute,
  onSetVolume,
  onResetProgress,
  onReplayTutorial,
}: SettingsScreenProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(getDefaultDifficulty);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const handleDifficultyChange = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setDefaultDifficulty(d);
  }, []);

  const handleExport = useCallback(() => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("geo-")) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) ?? "null");
        } catch {
          data[key!] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `geochallenge-stats-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMsg("Stats exported!");
    setTimeout(() => setExportMsg(null), 2000);
  }, []);

  return (
    <div
      className="min-h-dvh font-sans text-slate-200 overflow-y-auto"
      style={{
        background: "linear-gradient(160deg, #0a0f1e 0%, #0f1d35 50%, #111827 100%)",
      }}
    >
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            className="btn-ghost"
            onClick={() => navigate({ kind: "menu" })}
          >
            ← Back
          </button>
          <h1 className="gradient-text text-3xl font-black">⚙️ Settings</h1>
        </div>

        {/* Sound */}
        <section className="card mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Sound
          </h2>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">Sound Effects</span>
            <button
              onClick={onToggleMute}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold border-none cursor-pointer transition-colors ${
                muted
                  ? "bg-slate-700 text-slate-400"
                  : "bg-blue-600/25 text-blue-400"
              }`}
            >
              {muted ? "🔇 Off" : "🔊 On"}
            </button>
          </div>
          {!muted && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-12">Volume</span>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => onSetVolume(Number(e.target.value))}
                className="flex-1 accent-blue-500 h-1.5"
              />
              <span className="text-xs text-slate-400 w-8 text-right tabular-nums">
                {volume}%
              </span>
            </div>
          )}
        </section>

        {/* Difficulty */}
        <section className="card mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Default Difficulty
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(DIFFICULTY_PRESETS) as [Difficulty, typeof DIFFICULTY_PRESETS.normal][]).map(
              ([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleDifficultyChange(key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-[1.5px] cursor-pointer transition-all ${
                    difficulty === key
                      ? "border-blue-500/50 bg-blue-500/15 text-white"
                      : "border-white/10 bg-white/[.04] text-slate-400 hover:bg-white/[.08]"
                  }`}
                >
                  <span className="text-lg">{preset.emoji}</span>
                  <span className="text-sm font-bold">{preset.label}</span>
                  <span className="text-[10px] text-slate-500 text-center leading-tight">
                    {preset.description}
                  </span>
                </button>
              ),
            )}
          </div>
        </section>

        {/* Data */}
        <section className="card mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Data
          </h2>
          <div className="space-y-3">
            <button
              className="btn-ghost w-full !text-left !px-4 !py-3"
              onClick={handleExport}
            >
              📤 Export Stats as JSON
              {exportMsg && (
                <span className="ml-2 text-green-400 text-xs">{exportMsg}</span>
              )}
            </button>
            <button
              className="btn-ghost w-full !text-left !px-4 !py-3"
              onClick={onReplayTutorial}
            >
              📖 Replay Tutorial
            </button>
            <button
              className="w-full text-left px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-semibold cursor-pointer hover:bg-red-500/15 transition-colors"
              onClick={() => setShowResetConfirm(true)}
            >
              🗑 Reset All Progress
            </button>
          </div>
        </section>

        {/* Version */}
        <div className="text-center text-xs text-slate-600 mt-6">
          GeoChallenge v2.0.0
        </div>
      </div>

      {showResetConfirm && (
        <ConfirmModal
          title="Reset All Progress?"
          message="This will permanently delete all scores, achievements, mastery data, and game history. This cannot be undone."
          confirmLabel="Reset Everything"
          danger
          onConfirm={() => {
            onResetProgress();
            setShowResetConfirm(false);
          }}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}
