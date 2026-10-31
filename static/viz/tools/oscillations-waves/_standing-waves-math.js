// Pure maths for the "Standing Waves & Music" box. No DOM.
// Modes (kind = 'string' fixed–fixed, 'open' open–open pipe, 'closed' closed–open pipe; n = 1, 2, 3 … counts the modes that exist):
//   harmonicNumber(kind, n)       1·ν₁ multiple: n for string and open pipe, 2n − 1 for a closed pipe
//   modeFreq(kind, n, v, L)       n v/2L  |  n v/2L  |  (2n − 1) v/4L
//   shape(kind, n, L, x)          the displacement pattern, height 1 at an antinode: sin(nπx/L) | cos(nπx/L) | sin((2n−1)πx/2L); closed end at x = 0
//   nodesOf, antinodesOf (kind, n, L)   positions in metres, ends included
// Two travelling waves make a standing one:
//   pair(a, k, w, x, t)           { right: a sin(kx − ωt), left: a sin(kx + ωt), sum, formula: 2a sin kx cos ωt }
//   nodePositions(k, from, to)    zeros of sin kx, which are nπ/k apart
// Fitting a pipe (tool "closed pipe"): r = ν/ν₁ with ν₁ = v/4L, so kL = (π/2)·r
//   endTest(type, r)              the right-hand end of the wave that already suits the left-hand end: { value, want, fits }
//   fitRatios(type, upTo)         the r values that fit: odd for 'closed-open', even for 'open-open'
// A string driven at x = 0, fixed at x = L, after N round trips of the wave (tool "only certain notes fit"):
//   drivenPhasor(x, p)            p = { k, L, N, q }; returns { right: [re, im], left: [re, im] } with time as e^{iφ}
//   drivenParts(x, phase, p)      { right, left, sum } heights in units of the driver's swing
//   swingGain(nu, o)              largest swing along the string ÷ driver swing; o = { v, L, N, q }
// Music and strings:
//   stringSpeed(T, mu), stringFreq(T, mu, L), noteOf(freq) → { name, midi, cents }, semitones(f, f0), fretLength(L0, k)
// Resonance column (closed tube, water at the bottom):
//   airSpeed(theta), endCorrection(r), resonanceLengths(f, theta, r, count), loudness(l, f, theta, r)
//   speedFromTwo(f, l1, l2) = 2f(l2 − l1), speedFromOne(f, l1) = 4f·l1, endFromTwo(l1, l2) = (l2 − 3·l1)/2
export const TAU = Math.PI * 2;
export const Q = 0.85; // a driven string keeps 85% of its swing after each round trip (the rest is lost to air and the ends)

export const harmonicNumber = (kind, n) => (kind === 'closed' ? 2 * n - 1 : n);

export function modeFreq(kind, n, v, L) {
  return kind === 'closed' ? ((2 * n - 1) * v) / (4 * L) : (n * v) / (2 * L);
}

export function shape(kind, n, L, x) {
  if (kind === 'string') return Math.sin((n * Math.PI * x) / L);
  if (kind === 'open') return Math.cos((n * Math.PI * x) / L);
  return Math.sin(((2 * n - 1) * Math.PI * x) / (2 * L));
}

const range = (count, from) => Array.from({ length: count }, (_, j) => from(j));

export function nodesOf(kind, n, L) {
  if (kind === 'string') return range(n + 1, (j) => (j * L) / n);
  if (kind === 'open') return range(n, (j) => ((j + 0.5) * L) / n);
  return range(n, (j) => (2 * j * L) / (2 * n - 1));
}

export function antinodesOf(kind, n, L) {
  if (kind === 'string') return range(n, (j) => ((j + 0.5) * L) / n);
  if (kind === 'open') return range(n + 1, (j) => (j * L) / n);
  return range(n, (j) => ((2 * j + 1) * L) / (2 * n - 1));
}

export function pair(a, k, w, x, t) {
  const right = a * Math.sin(k * x - w * t);
  const left = a * Math.sin(k * x + w * t);
  return { right, left, sum: right + left, formula: 2 * a * Math.sin(k * x) * Math.cos(w * t) };
}

export const nodePositions = (k, from, to) => {
  const out = [];
  for (let n = Math.ceil((from * k) / Math.PI - 1e-9); (n * Math.PI) / k <= to + 1e-9; n++) out.push((n * Math.PI) / k);
  return out;
};

// Pipe fitting. The wave is sin(kx) (closed left end, always a node) or cos(kx) (open left end, always an antinode).
export function endTest(type, r) {
  const kL = (Math.PI / 2) * r;
  if (type === 'open-open') {
    const value = Math.abs(Math.cos(kL));
    return { value, want: 1, fits: Math.abs(value - 1) < 0.02 };
  }
  const value = Math.abs(Math.sin(kL));
  return { value, want: 1, fits: Math.abs(value - 1) < 0.02 };
}

export const fitRatios = (type, upTo) => range(upTo, (j) => (type === 'open-open' ? 2 * (j + 1) : 2 * j + 1)).filter((r) => r <= upTo);

// ---- the driven string ----
const mul = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];
const cis = (angle) => [Math.cos(angle), Math.sin(angle)];
const scale = ([a, b], s) => [a * s, b * s];

export function drivenPhasor(x, { k, L, N = 10, q = Q }) {
  const g = -Math.log(q) / (2 * L); // loss per metre, so every round trip keeps the fraction q
  const w = scale(cis(-2 * k * L), q);
  const wn = scale(cis(-2 * k * L * (N + 1)), q ** (N + 1));
  const top = [1 - wn[0], -wn[1]];
  const bottom = [1 - w[0], -w[1]];
  const den = bottom[0] ** 2 + bottom[1] ** 2;
  const S = mul(top, [bottom[0] / den, -bottom[1] / den]);
  const right = mul(scale(cis(-k * x), Math.exp(-g * x)), S);
  const left = scale(mul(scale(cis(-k * (2 * L - x)), Math.exp(-g * (2 * L - x))), S), -1);
  return { right, left };
}

export function drivenParts(x, phase, p) {
  const { right, left } = drivenPhasor(x, p);
  const at = ([re, im]) => re * Math.sin(phase) + im * Math.cos(phase);
  return { right: at(right), left: at(left), sum: at(right) + at(left) };
}

export function swingGain(nu, { v, L, N = 10, q = Q, points = 48 }) {
  const k = (TAU * nu) / v;
  let best = 0;
  for (let i = 0; i <= points; i++) {
    const { right, left } = drivenPhasor((L * i) / points, { k, L, N, q });
    best = Math.max(best, Math.hypot(right[0] + left[0], right[1] + left[1]));
  }
  return best;
}

// ---- music ----
export const stringSpeed = (T, mu) => Math.sqrt(T / mu);
export const stringFreq = (T, mu, L) => stringSpeed(T, mu) / (2 * L);
export const semitones = (f, f0) => 12 * Math.log2(f / f0);
export const fretLength = (L0, k) => L0 / 2 ** (k / 12);

const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export function noteOf(freq) {
  const exact = 69 + 12 * Math.log2(freq / 440);
  const midi = Math.round(exact);
  return { name: `${NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`, midi, cents: Math.round((exact - midi) * 100) };
}

// ---- resonance column ----
export const airSpeed = (theta) => 331.3 * Math.sqrt(1 + theta / 273.15);
export const endCorrection = (r) => 0.6 * r;
export const resonanceLengths = (f, theta, r, count = 3) => {
  const lambda = airSpeed(theta) / f;
  return range(count, (j) => ((2 * j + 1) * lambda) / 4 - endCorrection(r));
};
// How loud the tube is (1 = as loud as it gets): a round trip is delayed by 2k(l + e) and flips once at the water, keeping q.
export function loudness(l, f, theta, r, q = 0.8) {
  const phi = (TAU * f * 2 * (l + endCorrection(r))) / airSpeed(theta);
  return (1 - q) / Math.sqrt(1 + q * q + 2 * q * Math.cos(phi));
}
export const speedFromTwo = (f, l1, l2) => 2 * f * (l2 - l1);
export const speedFromOne = (f, l1) => 4 * f * l1;
export const endFromTwo = (l1, l2) => (l2 - 3 * l1) / 2;
