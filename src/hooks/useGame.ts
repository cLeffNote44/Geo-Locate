import { useReducer, useMemo } from "react";
import { gameReducer, initialGameState } from "../state/gameReducer";
import * as sel from "../state/selectors";
import type { GameAction, CountryId } from "../types";

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const derived = useMemo(
    () => ({
      currentCountryId: sel.currentCountryId(state),
      progress: sel.progress(state),
      correctSet: sel.correctSet(state),
      wrongSet: sel.wrongSet(state),
      correctCount: sel.correctCount(state),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.currentIndex, state.results.length, state.queue],
  );

  return { state, derived, dispatch: dispatch as React.Dispatch<GameAction> };
}

export type GameDerived = {
  currentCountryId: CountryId | null;
  progress: number;
  correctSet: Set<CountryId>;
  wrongSet: Set<CountryId>;
  correctCount: number;
};
