// Pure maths for the Interference box (NCERT XII 10.4-10.5). No DOM. Lengths in metres unless a name says nm or mm.
export const N_FILM = 1.33; // soap solution, as in the tool
export const CHANNELS = [
  { name: 'red', nm: 650 },
  { name: 'green', nm: 550 },
  { name: 'blue', nm: 450 },
];

// ---- two sources ----
// Exact path difference from the two slits (at y = +-d/2) to the screen point at height y, screen D away.
export function pathDiff(y, d, D) {
  return Math.hypot(D, y + d / 2) - Math.hypot(D, y - d / 2);
}
export const pathDiffSmall = (y, d, D) => (d * y) / D; // d sin(theta), theta small
// Two equal waves with phase offset phi: intensity normalised so one wave alone is 1 (so the sum runs 0..4).
export const twoWave = (delta, lambda, phi = 0) => 2 + 2 * Math.cos((2 * Math.PI * delta) / lambda + phi);
export const fringeWidth = (lambda, D, d) => (lambda * D) / d;
export const brightAt = (n, lambda, D, d) => (n * lambda * D) / d;
export const darkAt = (n, lambda, D, d) => ((n + 0.5) * lambda * D) / d;
// Fixed phases (radians) of two separate bulbs, one per snapshot: they have no steady relation.
export const BULB_PHASES = [0, 2.4, 4.9, 1.1, 3.7, 5.6, 0.7, 2.9, 4.2, 5.2, 1.9, 3.3];
// Average over the first n snapshots, with each snapshot's own phase (bulbs) or none (slits).
export function averaged(delta, lambda, n, coherent) {
  let sum = 0;
  for (let k = 0; k < n; k++) sum += twoWave(delta, lambda, coherent ? 0 : BULB_PHASES[k]);
  return sum / n;
}
// Fringe contrast (max - min) / (max + min) of the averaged pattern.
export function contrast(n, coherent) {
  if (coherent) return 1;
  let c = 0;
  let s = 0;
  for (let k = 0; k < n; k++) {
    c += Math.cos(BULB_PHASES[k]);
    s += Math.sin(BULB_PHASES[k]);
  }
  return Math.hypot(c, s) / n;
}

// ---- classifying a point by its path difference, in wavelengths ----
export function classify(delta, lambda, tol = 0.1) {
  const w = delta / lambda;
  const near = Math.round(w);
  if (Math.abs(w - near) <= tol) return { kind: 'bright', order: Math.abs(near) };
  const half = Math.round(w - 0.5) + 0.5;
  if (Math.abs(w - half) <= tol) return { kind: 'dark', order: Math.abs(half) - 0.5 };
  return { kind: 'between', order: null };
}
// Most bright fringes that can exist: |delta| <= d always, so orders run to floor(d / lambda).
export const brightCount = (d, lambda) => 2 * Math.floor(d / lambda + 1e-9) + 1;

// ---- thin film, normal incidence ----
// The front surface reflects with a half-turn flip, the back surface does not, so reflected intensity ~ sin^2(2 pi n t / lambda).
export const filmIntensity = (t, lambda, n = N_FILM) => Math.sin((2 * Math.PI * n * t) / lambda) ** 2;
export const brightThickness = (m, lambda, n = N_FILM) => ((m + 0.5) * lambda) / (2 * n);
export function strongest(t, n = N_FILM) {
  return CHANNELS.map((c) => ({ ...c, i: filmIntensity(t, c.nm, n) })).sort((a, b) => b.i - a.i)[0];
}
