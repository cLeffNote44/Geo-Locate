import type { GameState, GameAction } from "../types";

export const initialGameState: GameState = {
  mode: "classic",
  region: "world",
  queue: [],
  currentIndex: 0,
  lives: 3,
  results: [],
  flash: null,
  wrongClickId: null,
  answerRevealed: false,
  finished: false,
  startedAt: 0,
  roundStartedAt: 0,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "INIT_GAME":
      return {
        ...initialGameState,
        mode: action.mode,
        region: action.region,
        queue: action.queue,
        lives: action.mode === "practice" ? Infinity : (action.lives ?? 3),
        startedAt: Date.now(),
        roundStartedAt: Date.now(),
      };

    case "CLICK_COUNTRY": {
      if (state.finished) return state;
      if (state.currentIndex >= state.queue.length) return state;

      const targetId = state.queue[state.currentIndex];
      const timeMs = action.timestamp - state.roundStartedAt;

      if (action.countryId === targetId) {
        // Correct answer
        const newResults = [
          ...state.results,
          { countryId: targetId, correct: true, timeMs },
        ];
        const newIndex = state.currentIndex + 1;
        const finished = newIndex >= state.queue.length;

        return {
          ...state,
          results: newResults,
          currentIndex: newIndex,
          flash: { type: "correct" },
          wrongClickId: null,
          answerRevealed: false,
          finished,
          roundStartedAt: Date.now(),
        };
      }

      // Wrong answer
      if (state.mode === "classic") {
        const newLives = state.lives - 1;
        const finished = newLives <= 0;
        return {
          ...state,
          results: [
            ...state.results,
            { countryId: targetId, correct: false, timeMs },
          ],
          lives: newLives,
          flash: { type: "wrong" },
          wrongClickId: targetId, // show WHERE the correct country was
          answerRevealed: false,
          finished,
          // In classic, advance to next country even on wrong answer
          currentIndex: finished ? state.currentIndex : state.currentIndex + 1,
          roundStartedAt: Date.now(),
        };
      }

      // Practice mode: stay on same country
      return {
        ...state,
        results: [
          ...state.results,
          { countryId: targetId, correct: false, timeMs },
        ],
        flash: { type: "wrong" },
        wrongClickId: targetId, // highlight where the correct one is
      };
    }

    case "REVEAL_ANSWER":
      return { ...state, answerRevealed: true };

    case "NEXT_COUNTRY": {
      const newIndex = state.currentIndex + 1;
      const finished = newIndex >= state.queue.length;
      return {
        ...state,
        currentIndex: newIndex,
        wrongClickId: null,
        answerRevealed: false,
        finished,
        roundStartedAt: Date.now(),
      };
    }

    case "CLEAR_FLASH":
      return { ...state, flash: null };

    case "CLEAR_WRONG_HIGHLIGHT":
      return { ...state, wrongClickId: null };

    case "QUIT":
      return { ...state, finished: true };

    default:
      return state;
  }
}
