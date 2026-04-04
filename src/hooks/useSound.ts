import { useState, useCallback } from "react";
import { load, save } from "../lib/storage";
import {
  playCorrectSound,
  playWrongSound,
  playStreakSound,
  playWinSound,
  playLoseSound,
  playClickSound,
  playHintSound,
  setMasterVolume,
} from "../lib/sounds";

const MUTE_KEY = "geo-muted";
const VOLUME_KEY = "geo-volume";

export function useSound() {
  const [muted, setMuted] = useState(() => load<boolean>(MUTE_KEY, false));
  const [volume, setVolume] = useState(() => {
    const v = load<number>(VOLUME_KEY, 80);
    setMasterVolume(v / 100);
    return v;
  });

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      save(MUTE_KEY, next);
      return next;
    });
  }, []);

  const updateVolume = useCallback((v: number) => {
    setVolume(v);
    save(VOLUME_KEY, v);
    setMasterVolume(v / 100);
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

  const playHint = useCallback(() => {
    if (!muted) playHintSound();
  }, [muted]);

  return { muted, volume, toggleMute, updateVolume, playCorrect, playWrong, playStreak, playWin, playLose, playClick, playHint };
}
