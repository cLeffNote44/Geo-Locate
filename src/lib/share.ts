import type { GameSummary } from "../types";
import { getRegionLabel } from "../data/regions";
import { getDailyNumber } from "./daily";

export function formatShareText(summary: GameSummary): string {
  const region = getRegionLabel(summary.region);
  const pct = Math.round((summary.correctCount / (summary.totalCountries || 1)) * 100);
  const totalSecs = Math.round(summary.totalTimeMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, "0")}`;

  const lines: string[] = [];

  if (summary.mode === "daily") {
    lines.push(`📅 GeoChallenge Daily #${getDailyNumber()}`);
  } else {
    lines.push(`🌍 GeoChallenge — ${region}`);
  }

  lines.push(
    `🎯 ${summary.correctCount}/${summary.totalCountries} (${pct}%) | ⏱ ${timeStr} | 🔥 ${summary.maxStreak} streak`,
  );

  const badges: string[] = [];
  badges.push(`⭐ ${summary.score.toLocaleString()} pts`);
  if (pct === 100) badges.push("💎 Flawless");
  else if (summary.won) badges.push("🏆 Won");
  if (summary.difficulty === "hard") badges.push("💀 Hard");
  lines.push(badges.join(" | "));

  lines.push("Play at leffel.io/games/geo-challenge");

  return lines.join("\n");
}

export async function copyShareText(summary: GameSummary): Promise<boolean> {
  const text = formatShareText(summary);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}
