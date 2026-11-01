// Pure maths for the Quadratic Equations box. No DOM.
export const disc = (a, b, c) => b * b - 4 * a * c;
export function realRoots(a, b, c) {
  const d = disc(a, b, c);
  if (d < 0) return [];
  if (d === 0) return [-b / (2 * a)];
  return [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)];
}
export const countRoots = (a, b, c) => { const d = disc(a, b, c); return d > 0 ? 2 : d === 0 ? 1 : 0; };
export const vertexHeight = (a, b, c) => c - (b * b) / (4 * a); // = −D / 4a
export const isPerfectSquare = (n) => n >= 0 && Number.isInteger(n) && Number.isInteger(Math.sqrt(n));

// ---- completing the square: the numbers behind each tile move ----
export function tiles(a, b, c) {
  const t = b / (2 * a); // half of b/a
  return { t, p: b / a, q: -c / a, corner: t * t, rhs: -c / a + t * t, rhsCheck: disc(a, b, c) / (4 * a * a) };
}

// ---- sum and product ----
export function expand(a, r, s) { return { a, b: -a * (r + s), c: a * r * s }; }

// ---- radical equations √(x + p) = x + q ----
// Squaring gives x² + (2q − 1)x + q² − p = 0. A root is genuine only if x + q ≥ 0 and x + p ≥ 0.
export function radical(p, q) {
  const b = 2 * q - 1;
  const c = q * q - p;
  return realRoots(1, b, c).map((x) => {
    const left = x + p >= 0 ? Math.sqrt(x + p) : NaN;
    const right = x + q;
    return { x, left, right, valid: x + p >= -1e-12 && right >= -1e-9 };
  });
}

// ---- ball thrown up from height h0 with speed v0, g = 9.8 ----
export const G = 9.8;
export const ballHeight = (h0, v0, t) => h0 + v0 * t - 0.5 * G * t * t;
export function ballRoots(h0, v0) {
  const d = v0 * v0 + 2 * G * h0;
  const root = Math.sqrt(d);
  return { early: (v0 - root) / G, late: (v0 + root) / G, top: v0 / G, peak: h0 + (v0 * v0) / (2 * G) };
}

// ---- the three methods ----
// Integers m, n with m + n = b and m n = a c, or null (then ax² + bx + c does not factor over the integers)
export function splitMiddle(a, b, c) {
  const target = a * c;
  for (let m = -Math.abs(target) - Math.abs(b) - 1; m <= Math.abs(target) + Math.abs(b) + 1; m++) {
    const n = b - m;
    if (m * n === target && m !== 0 && n !== 0) return [Math.min(m, n), Math.max(m, n)];
  }
  if (c === 0) return [0, b];
  return null;
}
export function quickest(a, b, c) {
  const d = disc(a, b, c);
  if (splitMiddle(a, b, c) && isPerfectSquare(d)) return 'factor';
  if (a === 1 && b % 2 === 0) return 'complete';
  return 'formula';
}

// ---- equations quadratic in form: x⁴ + p x² + q = 0, with u = x² ----
export function inForm(p, q) {
  const d = p * p - 4 * q;
  const us = d < 0 ? [] : d === 0 ? [-p / 2] : [(-p - Math.sqrt(d)) / 2, (-p + Math.sqrt(d)) / 2];
  const xs = [];
  const complex = [];
  for (const u of us) {
    if (u > 0) xs.push(-Math.sqrt(u), Math.sqrt(u));
    else if (u === 0) xs.push(0);
    else complex.push(Math.sqrt(-u));
  }
  return { d, us, xs: xs.sort((a, b) => a - b), complex };
}

// ---- the Babylonian cut-and-move: long side L, short side W, area q, L − W = p ----
export function babylonian(p, q) {
  const m = Math.sqrt(q + (p / 2) ** 2);
  return { m, L: m + p / 2, W: m - p / 2, corner: (p / 2) ** 2 };
}
