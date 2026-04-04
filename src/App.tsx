import { useState } from "react";
import type { Screen } from "./types";
import { useGameHistory } from "./hooks/useGameHistory";
import MenuScreen from "./screens/MenuScreen";
import RegionSelectScreen from "./screens/RegionSelectScreen";
import GameScreen from "./screens/GameScreen";
import ReviewScreen from "./screens/ReviewScreen";
import StatsScreen from "./screens/StatsScreen";

const isEmbed = new URLSearchParams(window.location.search).has("embed");

export default function App() {
  const [screen, setScreen] = useState<Screen>({ kind: "menu" });
  const { history } = useGameHistory();

  const navigate = (s: Screen) => setScreen(s);

  const content = (() => {
    switch (screen.kind) {
      case "menu":
        return <MenuScreen history={history} navigate={navigate} />;
      case "regionSelect":
        return (
          <RegionSelectScreen mode={screen.mode} navigate={navigate} />
        );
      case "game":
        return (
          <GameScreen
            key={`${screen.mode}-${screen.region}-${Date.now()}`}
            mode={screen.mode}
            region={screen.region}
            navigate={navigate}
          />
        );
      case "review":
        return <ReviewScreen summary={screen.summary} navigate={navigate} />;
      case "stats":
        return <StatsScreen history={history} navigate={navigate} />;
    }
  })();

  return (
    <div
      key={screen.kind}
      className={`screen-enter ${isEmbed ? "" : ""}`}
    >
      {content}
    </div>
  );
}
