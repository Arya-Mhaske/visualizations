// Pure maths for the Tan, Cot, Sec, Csc box. Radians unless a name says degrees. No DOM.
import { rad } from './_right-triangle-math.js';

export const PI = Math.PI;

// ---- lengths on the unit circle (degrees in) ----
export const tanLen = (theta) => Math.tan(rad(theta));
export const secLen = (theta) => 1 / Math.cos(rad(theta));
export const cotLen = (theta) => 1 / Math.tan(rad(theta));
export const cscLen = (theta) => 1 / Math.sin(rad(theta));
// The secant ray from the centre meets the tangent line x = 1 at (1, tan θ); its length is √(1 + tan²θ) = |sec θ|
export const secantLength = (theta) => Math.hypot(1, Math.tan(rad(theta)));
// The same ray meets the line y = 1 (the tangent at the top) at (cot θ, 1)
export const topHit = (theta) => [cotLen(theta), 1];

// ---- the four graphs: y = A f(Bx + C) ----
const FUNCS = {
  tan: Math.tan,
  cot: (u) => 1 / Math.tan(u),
  sec: (u) => 1 / Math.cos(u),
  csc: (u) => 1 / Math.sin(u),
};
export const curve = (kind, A, B, C) => (x) => A * FUNCS[kind](B * x + C);
// Where the guide changes: u = Bx + C is π/2 + nπ for tan and sec (cos = 0), and nπ for cot and csc (sin = 0)
const ASYMPTOTE_AT = { tan: PI / 2, sec: PI / 2, cot: 0, csc: 0 };
const nSpan = (B, C, lo, hi, offset) => [Math.ceil((B * lo + C - offset) / PI - 1e-9), Math.floor((B * hi + C - offset) / PI + 1e-9)];
export function asymptotes(kind, B, C, lo, hi) {
  const off = ASYMPTOTE_AT[kind];
  const [n0, n1] = nSpan(B, C, lo, hi, off);
  const out = [];
  for (let n = n0; n <= n1; n++) out.push((off + n * PI - C) / B);
  return out;
}
// Where tan and cot cross the x-axis: halfway between asymptotes
export function zeros(kind, B, C, lo, hi) {
  const off = kind === 'tan' ? 0 : PI / 2;
  const [n0, n1] = nSpan(B, C, lo, hi, off);
  const out = [];
  for (let n = n0; n <= n1; n++) out.push((off + n * PI - C) / B);
  return out;
}
// Where tan or cot reaches ±A: a quarter of the way between asymptotes
export function quarterPoints(kind, A, B, C, lo, hi) {
  const out = [];
  const offsets = kind === 'tan' ? [[-PI / 4, -1], [PI / 4, 1]] : [[PI / 4, 1], [(3 * PI) / 4, -1]];
  for (const [off, sign] of offsets) {
    const [n0, n1] = nSpan(B, C, lo, hi, off);
    for (let n = n0; n <= n1; n++) out.push({ x: (off + n * PI - C) / B, y: sign * A });
  }
  return out.sort((p, q) => p.x - q.x);
}
// The bottoms of the U-shapes of sec and csc: where the guide A cos(…) or A sin(…) is at its peak or trough
export function vertices(kind, A, B, C, lo, hi) {
  const off = kind === 'sec' ? 0 : PI / 2;
  const [n0, n1] = nSpan(B, C, lo, hi, off);
  const out = [];
  for (let n = n0; n <= n1; n++) out.push({ x: (off + n * PI - C) / B, y: A * (n % 2 === 0 ? 1 : -1) });
  return out;
}
export const guide = (kind, A, B, C) => (x) => A * (kind === 'sec' ? Math.cos(B * x + C) : Math.sin(B * x + C));
export const period = (kind, B) => (kind === 'tan' || kind === 'cot' ? PI / B : (2 * PI) / B);

// ---- reciprocal pairs on one graph ----
export const PAIRS = {
  sin: { text: 'sin x and csc x', f: Math.sin, g: (x) => 1 / Math.sin(x) },
  cos: { text: 'cos x and sec x', f: Math.cos, g: (x) => 1 / Math.cos(x) },
};

// ---- no amplitude for tan: y = A tan x passes any height H at x = arctan(H / A) ----
export const crossing = (A, H) => Math.atan(H / A);
export const tanAt = (A, x) => A * Math.tan(x);

// ---- the lighthouse: a beam turning at a steady rate, a spot on a straight wall d metres away ----
export const spotPosition = (d, theta) => d * Math.tan(rad(theta));
// Speed along the wall = d · ω · sec²θ, with ω in radians per second
export const spotSpeed = (d, degPerSecond, theta) => d * rad(degPerSecond) / Math.cos(rad(theta)) ** 2;
export const speedUp = (theta) => 1 / Math.cos(rad(theta)) ** 2; // compared with the speed straight ahead
