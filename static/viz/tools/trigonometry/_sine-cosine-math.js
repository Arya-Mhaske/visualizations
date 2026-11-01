// Pure maths for the Sine & Cosine Graphs box. Radians throughout, except where a name says degrees. No DOM.
export const TAU = Math.PI * 2;

// ---- y = k + A sin(Bx + C), with B > 0 ----
export const wave = (A, B, C, k) => (x) => k + A * Math.sin(B * x + C);
export const period = (B) => TAU / Math.abs(B);
// y = sin(B(x − s)) with s = −C/B, so the graph moves left by C/B when C > 0
export const shift = (B, C) => -C / B;
// The five key points: start of a cycle, top, middle, bottom, end.
export function keyPoints(A, B, C, k) {
  const P = period(B);
  const s = shift(B, C);
  return [0, 1, 2, 3, 4].map((i) => ({ x: s + (i * P) / 4, y: [k, k + A, k, k - A, k][i] }));
}
// Where the arrow of a spinner points when the clock reads x: its tip is at height A sin(Bx + C) above the axle.
export const spinnerAngle = (B, C, x) => B * x + C;
// The tip of a spinner of radius |A|: with a negative A the arrow points the other way, so its height is still A sin(…)
export function tip(A, B, C, x) {
  const phi = spinnerAngle(B, C, x) + (A < 0 ? Math.PI : 0);
  return [Math.abs(A) * Math.cos(phi), Math.abs(A) * Math.sin(phi)];
}

// ---- cosine is sine started a quarter turn early ----
export const cosAsSine = (x) => Math.sin(x + Math.PI / 2);

// ---- a transformation lab: y = A f(Bx + C) + k, applied to the points of any graph ----
export const BASES = {
  sin: { text: 'sin x', f: Math.sin, points: [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI], view: [[-7, 7], [-5, 5]] },
  sq: { text: 'x²', f: (x) => x * x, points: [-2, -1, 0, 1, 2], view: [[-7, 7], [-5, 9]] },
  abs: { text: '|x|', f: Math.abs, points: [-2, -1, 0, 1, 2], view: [[-7, 7], [-5, 7]] },
  cube: { text: 'x³/3', f: (x) => (x ** 3) / 3, points: [-2, -1, 0, 1, 2], view: [[-7, 7], [-6, 6]] },
};
export const transformPoint = ([u, v], { A, B, C, k }) => [(u - C) / B, A * v + k];
export const transformed = (f, { A, B, C, k }) => (x) => A * f(B * x + C) + k;

// ---- fitting a target graph: the root-mean-square gap between two waves ----
export function gap(f, g, from, to, n = 400) {
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const x = from + ((to - from) * i) / n;
    sum += (f(x) - g(x)) ** 2;
  }
  return Math.sqrt(sum / (n + 1));
}
export const TARGETS = [
  { A: 2, B: 1, C: 0, k: 0 },
  { A: 1.5, B: 2, C: 0, k: 1 },
  { A: 2, B: 1, C: Math.PI / 2, k: -1 },
  { A: 3, B: 0.5, C: 0, k: 0 },
  { A: 1, B: 3, C: Math.PI / 3, k: 0.5 },
  { A: -2, B: 1.5, C: 0, k: 0 },
];

// ---- aliasing: a plotter that takes a fixed number of samples across the window ----
// cycles is how many full cycles of the true wave fit in the window. The plotter joins samples with straight lines.
export const sampledPoints = (cycles, samples) => Array.from({ length: samples + 1 }, (_, i) => [i / samples, Math.sin(TAU * cycles * (i / samples))]);
// The number of cycles the samples seem to show: the distance to the nearest multiple of the sample count
export function apparentCycles(cycles, samples) {
  const f = cycles / samples;
  return Math.abs(f - Math.round(f)) * samples;
}
export const nyquist = (samples) => samples / 2;

// ---- the tilted-line illusion: d = a + b sin 4θ, θ in degrees ----
export const tiltError = (theta, a, b) => a + b * Math.sin((4 * theta * Math.PI) / 180);
export const TILT_PERIOD = 90; // degrees, TAU / 4 turned into degrees

// ---- daylight hours, from the Sun's declination (calculated, not measured) ----
export const CITIES = {
  tvm: { text: 'Thiruvananthapuram', short: 'Trivandrum', lat: 8.5 },
  maa: { text: 'Chennai', short: 'Chennai', lat: 13.1 },
  del: { text: 'Delhi', short: 'Delhi', lat: 28.6 },
  srn: { text: 'Srinagar', short: 'Srinagar', lat: 34.1 },
};
// Declination in degrees on day n of the year (n = 1 on 1 January)
export const declination = (n) => -23.44 * Math.cos((TAU * (n + 10)) / 365);
export function daylight(latDeg, n) {
  const phi = (latDeg * Math.PI) / 180;
  const delta = (declination(n) * Math.PI) / 180;
  const c = -Math.tan(phi) * Math.tan(delta);
  return (24 / Math.PI) * Math.acos(Math.max(-1, Math.min(1, c)));
}
// The 15th of each month, as day of the year (a non-leap year), and as months since 1 January
export const MID_DAYS = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349];
export const monthsSince = (n) => ((n - 1) / 365) * 12;
export const dataFor = (city) => MID_DAYS.map((n) => ({ x: monthsSince(n), y: daylight(CITIES[city].lat, n) }));

// ---- least-squares sine: y = B + A sin(ωx − φ) for a chosen period, by solving the 3 × 3 normal equations ----
export function leastSquaresSine(points, periodMonths) {
  const w = TAU / periodMonths;
  const rows = points.map((p) => [1, Math.sin(w * p.x), Math.cos(w * p.x), p.y]);
  const m = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  for (const r of rows) for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) m[i][j] += r[i] * r[j];
  for (let i = 0; i < 3; i++) { // Gaussian elimination with partial pivoting
    let best = i;
    for (let r = i + 1; r < 3; r++) if (Math.abs(m[r][i]) > Math.abs(m[best][i])) best = r;
    [m[i], m[best]] = [m[best], m[i]];
    for (let r = 0; r < 3; r++) {
      if (r === i) continue;
      const factor = m[r][i] / m[i][i];
      for (let j = i; j < 4; j++) m[r][j] -= factor * m[i][j];
    }
  }
  const [B, a, b] = [m[0][3] / m[0][0], m[1][3] / m[1][1], m[2][3] / m[2][2]];
  const A = Math.hypot(a, b);
  const phi = Math.atan2(-b, a);
  return { B, A, phi, w, rms: rmsError(points, { B, A, phi, w }) };
}
export const sineModel = ({ B, A, phi, w }) => (x) => B + A * Math.sin(w * x - phi);
export function rmsError(points, model) {
  const f = sineModel(model);
  return Math.sqrt(points.reduce((s, p) => s + (p.y - f(p.x)) ** 2, 0) / points.length);
}
