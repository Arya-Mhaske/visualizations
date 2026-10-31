// Beats box: two close notes, a string tuned against a fork, and a guitar tuned string by string.
import { createRng } from '../../lib/rng.js';

export const TAU = Math.PI * 2;
export const FORK = 440; // Hz: the reference A₄
export const STRING_LENGTH = 0.33; // m: the game's string
export const IN_TUNE = 0.25; // beats per second: slower than one beat in 4 s counts as tuned

export const beatRate = (a, b) => Math.abs(a - b);
// Signed: how many cycles the second note is ahead of the first after t seconds.
export const lag = (a, b, t) => (b - a) * t;
export const wave = (nu, t, shift = 0) => Math.sin(TAU * (nu * t + shift));
export const sum = (a, b, t) => wave(a, t) + wave(b, t);
// sin A + sin B = 2 cos((A − B)/2) sin((A + B)/2): the slow factor and the fast one.
export const envelope = (a, b, t) => 2 * Math.cos(Math.PI * (a - b) * t);
export const carrier = (a, b, t) => Math.sin(Math.PI * (a + b) * t);
export const swing = (a, b, t) => Math.abs(envelope(a, b, t));
// 0 to 1. The square of the swing, so the sign of the cos does not matter: it repeats at |a − b|, not half of it.
export const loudness = (a, b, t) => envelope(a, b, t) ** 2 / 4;

// How far a lag of `cycles` is from a whole number of cycles (0: in step; 0.5: exactly opposite).
export const offStep = (cycles) => Math.abs(cycles - Math.round(cycles));
export const stepWord = (cycles) => {
  const off = offStep(cycles);
  if (off < 0.1) return 'in step';
  if (off > 0.4) return 'opposite';
  return 'sliding';
};

export const stringFreq = (T, mu, L = STRING_LENGTH) => Math.sqrt(T / mu) / (2 * L);
export const tensionFor = (nu, mu, L = STRING_LENGTH) => mu * (2 * L * nu) ** 2;

// A game string: at T0 it is 3 to 9 Hz from the fork, sharp or flat, by a mass per length the student can't see.
export function gameString(seed, T0 = 72) {
  const rng = createRng(seed);
  const gap = rng.int(6, 18) / 2;
  const start = FORK + (rng.next() < 0.5 ? -gap : gap);
  return { start, mu: T0 / (2 * STRING_LENGTH * start) ** 2 };
}

// From beats alone the string could be on either side of the fork.
export const candidates = (ref, beats) => [ref - beats, ref + beats];

// What the last peg move did to the beats.
export function moveWord(before, after) {
  if (after < IN_TUNE) return 'tuned';
  if (Math.abs(after - before) < 1e-9) return 'same';
  return after < before ? 'closer' : 'further';
}

// A guitar tuned from the fork, high string to low. Each string, pressed at its fret, must match the string above it.
export const GUITAR = [
  { name: 'E₄', semitones: -5, fret: 5 },
  { name: 'B₃', semitones: -10, fret: 5 },
  { name: 'G₃', semitones: -14, fret: 4 },
  { name: 'D₃', semitones: -19, fret: 5 },
  { name: 'A₂', semitones: -24, fret: 5 },
  { name: 'E₂', semitones: -29, fret: 5 },
];
export const PEG_TRUE = 100; // peg positions are cents: 0 to 200, wide enough to match a neighbour that is still out of tune
export const trueOpen = (i) => FORK * 2 ** (GUITAR[i].semitones / 12);
export const fretted = (nu, fret) => nu * 2 ** (fret / 12);
export const centsFrom = (nu, target) => 1200 * Math.log2(nu / target);
export const openFreq = (i, peg, offset) => trueOpen(i) * 2 ** ((peg - PEG_TRUE + offset) / 1200);
export const openFreqs = (pegs, offsets) => pegs.map((peg, i) => openFreq(i, peg, offsets[i]));
export const reference = (i, opens) => (i === 0 ? FORK : opens[i - 1]);
export const pairNote = (i, opens) => fretted(opens[i], GUITAR[i].fret);
export const pairBeats = (i, opens) => beatRate(pairNote(i, opens), reference(i, opens));
// Open E₂'s fourth harmonic against open E₄, the two-octave check at the end of the chain.
export const closure = (opens) => 4 * opens[5] - opens[0];

// Each string starts 15 to 35 cents sharp or flat, so every peg can reach its true pitch.
export function detune(seed) {
  const rng = createRng(seed);
  return GUITAR.map(() => (rng.next() < 0.5 ? -1 : 1) * rng.int(15, 35));
}
