let ctx: AudioContext | null = null;
let masterVolume = 0.8;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function setMasterVolume(v: number) {
  masterVolume = Math.max(0, Math.min(1, v));
}

export function getMasterVolume(): number {
  return masterVolume;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.15) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain * masterVolume;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch {
    // Web Audio not supported
  }
}

export function playCorrectSound() {
  playTone(523, 0.12, "sine", 0.12); // C5
  setTimeout(() => playTone(659, 0.12, "sine", 0.12), 80); // E5
  setTimeout(() => playTone(784, 0.18, "sine", 0.1), 160); // G5
}

export function playWrongSound() {
  playTone(200, 0.25, "sawtooth", 0.08);
  setTimeout(() => playTone(180, 0.3, "sawtooth", 0.06), 100);
}

export function playStreakSound(streak: number) {
  const baseFreq = 440 + Math.min(streak, 15) * 40;
  playTone(baseFreq, 0.08, "sine", 0.1);
  setTimeout(() => playTone(baseFreq * 1.25, 0.08, "sine", 0.1), 60);
  setTimeout(() => playTone(baseFreq * 1.5, 0.15, "sine", 0.08), 120);
}

export function playWinSound() {
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, "sine", 0.1), i * 120);
  });
  setTimeout(() => playTone(1047, 0.5, "triangle", 0.08), 500);
}

export function playLoseSound() {
  playTone(392, 0.2, "sine", 0.1);
  setTimeout(() => playTone(349, 0.2, "sine", 0.1), 150);
  setTimeout(() => playTone(330, 0.2, "sine", 0.1), 300);
  setTimeout(() => playTone(262, 0.5, "sine", 0.08), 450);
}

export function playClickSound() {
  playTone(800, 0.03, "sine", 0.05);
}

export function playHintSound() {
  playTone(440, 0.1, "sine", 0.08);
  setTimeout(() => playTone(554, 0.15, "sine", 0.08), 80);
}
