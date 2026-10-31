// Pure maths for "Why is a full turn 360°?" (no DOM, so it can be checked in isolation).

export const TOTALS = [360, 365, 100, 400];
export const MAX_N = 36;

export const divides = (total, n) => total % n === 0;

export function cleanSplits(total, maxN = MAX_N) {
  let count = 0;
  for (let n = 1; n <= maxN; n++) if (divides(total, n)) count++;
  return count;
}

export function divisorCount(total) {
  let count = 0;
  for (let d = 1; d <= total; d++) if (total % d === 0) count++;
  return count;
}

export const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

// Whole numbers print plainly; others to 3 decimals with trailing zeros trimmed (365/8 = 45.625).
export function fmt(x, places = 3) {
  const rounded = Number(x.toFixed(places));
  return String(rounded);
}

// theta in whole degrees -> radians as a multiple of π, e.g. 45 -> {p: 1, q: 4}. null if not "nice" (q > 12).
export function piFraction(thetaDeg) {
  if (!Number.isInteger(thetaDeg)) return null;
  if (thetaDeg === 0) return { p: 0, q: 1 };
  const g = gcd(thetaDeg, 180);
  const p = thetaDeg / g;
  const q = 180 / g;
  return q <= 12 ? { p, q } : null;
}

// Intersection of the circle (centre O, radius r) with the circle of radius r centred on A (on the first circle),
// returning the counter-clockwise one. This is the "compass step" of view 2.
export function compassStep(A, r) {
  const d = Math.hypot(A.x, A.y);          // O is the origin; d == r
  const a = d / 2;
  const h = Math.sqrt(Math.max(r * r - a * a, 0));
  const mx = (A.x / d) * a;
  const my = (A.y / d) * a;
  return { x: mx - (A.y / d) * h, y: my + (A.x / d) * h };
}
