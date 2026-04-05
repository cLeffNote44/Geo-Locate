import { useState, useCallback } from "react";
import type { Screen } from "./types";
import { useGameHistory } from "./hooks/useGameHistory";
import { useSound } from "./hooks/useSound";
import { useStreak } from "./hooks/useStreak";
import { load, save } from "./lib/storage";
import MenuScreen from "./screens/MenuScreen";
import RegionSelectScreen from "./screens/RegionSelectScreen";
import GameScreen from "./screens/GameScreen";
import ReviewScreen from "./screens/ReviewScreen";
import StatsScreen from "./screens/StatsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TerritoryScreen from "./screens/TerritoryScreen";
import TutorialOverlay from "./components/TutorialOverlay";

const isEmbed = new URLSearchParams(window.location.search).has("embed");
const TUTORIAL_KEY = "geo-tutorial-done";

export default function App() {
  const [screen, setScreen] = useState<Screen>({ kind: "menu" });
  const { history } = useGameHistory();
  const { muted, volume, toggleMute, updateVolume } = useSound();
  const { currentStreak, longestStreak } = useStreak();
  const [showTutorial, setShowTutorial] = useState(() => !load<boolean>(TUTORIAL_KEY, false));

  const navigate = (s: Screen) => setScreen(s);

  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
    save(TUTORIAL_KEY, true);
  }, []);

  const handleResetProgress = useCallback(() => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("geo-")) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }, []);

  const handleReplayTutorial = useCallback(() => {
    setShowTutorial(true);
    setScreen({ kind: "menu" });
  }, []);

  const content = (() => {
    switch (screen.kind) {
      case "menu":
        return (
          <MenuScreen
            history={history}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            navigate={navigate}
          />
        );
      case "regionSelect":
        return (
          <RegionSelectScreen mode={screen.mode} navigate={navigate} />
        );
      case "game":
        return (
          <GameScreen
            key={`${screen.mode}-${screen.region}-${screen.difficulty}-${Date.now()}`}
            mode={screen.mode}
            region={screen.region}
            difficulty={screen.difficulty}
            navigate={navigate}
          />
        );
      case "daily":
        return (
          <GameScreen
            key={`daily-${Date.now()}`}
            mode="daily"
            region="world"
            difficulty="normal"
            navigate={navigate}
          />
        );
      case "territory":
        return (
          <TerritoryScreen
            key={`territory-${screen.region}-${screen.difficulty}-${Date.now()}`}
            region={screen.region}
            difficulty={screen.difficulty}
            navigate={navigate}
          />
        );
      case "review":
        return <ReviewScreen summary={screen.summary} navigate={navigate} />;
      case "stats":
        return <StatsScreen history={history} navigate={navigate} />;
      case "settings":
        return (
          <SettingsScreen
            navigate={navigate}
            muted={muted}
            volume={volume}
            onToggleMute={toggleMute}
            onSetVolume={updateVolume}
            onResetProgress={handleResetProgress}
            onReplayTutorial={handleReplayTutorial}
          />
        );
    }
  })();

  return (
    <div
      key={screen.kind}
      className={`screen-enter ${isEmbed ? "" : ""}`}
    >
      {content}
      {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}
    </div>
  );
}
