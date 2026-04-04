import { useState, useCallback } from "react";
import { load, save } from "../lib/storage";
import {
  playCorrectSound,
  playWrongSound,
  playStreakSound,
  playWinSound,
  playLoseSound,
  playClickSound,
} from "../lib/sounds";

const MUTE_KEY = "geo-muted";

export function useSound() {
  const [muted, setMuted] = useState(() => load<boolean>(MUTE_KEY, false));

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      save(MUTE_KEY, next);
      return next;
    });
  }, []);

  const playCorrect = useCallback(() => {
    if (!muted) playCorrectSound();
  }, [muted]);

  const playWrong = useCallback(() => {
    if (!muted) playWrongSound();
  }, [muted]);

  const playStreak = useCallback(
    (n: number) => {
      if (!muted) playStreakSound(n);
    },
    [muted],
  );

  const playWin = useCallback(() => {
    if (!muted) playWinSound();
  }, [muted]);

  const playLose = useCallback(() => {
    if (!muted) playLoseSound();
  }, [muted]);

  const playClick = useCallback(() => {
    if (!muted) playClickSound();
  }, [muted]);

  return { muted, toggleMute, playCorrect, playWrong, playStreak, playWin, playLose, playClick };
}
