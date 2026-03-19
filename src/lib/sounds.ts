// Web Audio API sound effects - no external files needed
const audioCtx = typeof window !== "undefined" ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function ensureContext() {
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  if (!audioCtx) return;
  ensureContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function playClick() {
  playTone(800, 0.05, "square", 0.06);
}

export function playWin() {
  if (!audioCtx) return;
  ensureContext();
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, "sine", 0.12), i * 80);
  });
}

export function playBigWin() {
  if (!audioCtx) return;
  ensureContext();
  [523, 659, 784, 1047, 1319, 1568].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, "sine", 0.15), i * 100);
  });
}

export function playLose() {
  if (!audioCtx) return;
  ensureContext();
  playTone(200, 0.3, "sawtooth", 0.08);
  setTimeout(() => playTone(150, 0.4, "sawtooth", 0.06), 150);
}

export function playCrash() {
  if (!audioCtx) return;
  ensureContext();
  // Noise burst
  const bufferSize = audioCtx.sampleRate * 0.3;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
}

export function playReveal() {
  playTone(1200, 0.08, "sine", 0.08);
}

export function playMineHit() {
  if (!audioCtx) return;
  ensureContext();
  playTone(100, 0.5, "sawtooth", 0.12);
  setTimeout(() => playCrash(), 50);
}

export function playCashOut() {
  if (!audioCtx) return;
  ensureContext();
  [880, 1100, 1320].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, "triangle", 0.1), i * 60);
  });
}
