// Pure maths for the Systems & Matrices tools. No DOM. Reuses the linear-algebra helpers for matrices.
//   classify2 / intersection2     two lines a1 x + b1 y = c1 and a2 x + b2 y = c2: one, none or infinitely many solutions
//   clipHalf / region / vertices   linear programming: constraints are {a, b, c, op} meaning a x + b y (op) c, op '<=' or '>='
//   expandPF                       partial-fraction helpers
//   classifyMatrix                 the most specific name of a matrix: row, column, square, diagonal, scalar, identity, zero
export { rank, rad, det, det2, inverse, solve, mul, matVec, transpose, rref, eliminate, num, texNum, bmat, vecTex, identity } from '../linear-algebra/_la-math.js';

export function classify2(a1, b1, c1, a2, b2, c2) {
  const d = a1 * b2 - a2 * b1;
  if (Math.abs(d) > 1e-9) return { kind: 'one', x: (c1 * b2 - c2 * b1) / d, y: (a1 * c2 - a2 * c1) / d, det: d };
  const same = Math.abs(a1 * c2 - a2 * c1) < 1e-9 && Math.abs(b1 * c2 - b2 * c1) < 1e-9;
  return { kind: same ? 'many' : 'none', det: d };
}

// ---- linear programming ----
const EPS = 1e-9;
const ok = (k, x, y) => (k.op === '<=' ? k.a * x + k.b * y <= k.c + EPS : k.a * x + k.b * y >= k.c - EPS);
export const NONNEG = [{ a: 1, b: 0, c: 0, op: '>=' }, { a: 0, b: 1, c: 0, op: '>=' }];
export const feasible = (cons, x, y) => cons.every((k) => ok(k, x, y));

// Sutherland–Hodgman: keep the part of a polygon satisfying one constraint.
export function clipHalf(poly, k) {
  const f = (p) => (k.op === '<=' ? k.c - (k.a * p[0] + k.b * p[1]) : k.a * p[0] + k.b * p[1] - k.c);
  const out = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const [fp, fq] = [f(p), f(q)];
    if (fp >= -EPS) out.push(p);
    if ((fp > EPS && fq < -EPS) || (fp < -EPS && fq > EPS)) {
      const t = fp / (fp - fq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  });
  return out;
}
// The feasible region inside the window [0, w] × [0, h] (x, y ≥ 0 are the window's own edges).
export const region = (cons, w, h) => cons.reduce((poly, k) => (poly.length ? clipHalf(poly, k) : poly), [[0, 0], [w, 0], [w, h], [0, h]]);

// Corner points: every intersection of two boundary lines that satisfies all the constraints.
export function vertices(cons) {
  const out = [];
  for (let i = 0; i < cons.length; i++) for (let j = i + 1; j < cons.length; j++) {
    const r = classify2(cons[i].a, cons[i].b, cons[i].c, cons[j].a, cons[j].b, cons[j].c);
    if (r.kind === 'one' && feasible(cons, r.x, r.y) && !out.some((p) => Math.hypot(p[0] - r.x, p[1] - r.y) < 1e-7)) out.push([r.x, r.y]);
  }
  return out.sort((p, q) => Math.atan2(p[1] - 0, p[0]) - Math.atan2(q[1] - 0, q[0]));
}
export const best = (verts, f, maximise) => verts.reduce((m, p) => (m === null || (maximise ? f(p) > f(m) : f(p) < f(m)) ? p : m), null);

// Can the objective keep improving along some direction that never leaves the region? (Checks the recession directions.)
export function improvesForever(cons, f, maximise) {
  for (let t = 0; t <= 90; t += 0.5) {
    const d = [Math.cos((t * Math.PI) / 180), Math.sin((t * Math.PI) / 180)];
    const stays = cons.every((k) => (k.op === '<=' ? k.a * d[0] + k.b * d[1] <= EPS : k.a * d[0] + k.b * d[1] >= -EPS));
    const gain = f(d) - f([0, 0]);
    if (stays && (maximise ? gain > 1e-9 : gain < -1e-9)) return true;
  }
  return false;
}

// ---- partial fractions: (m x + n) / ((x − p)(x − q)) = A/(x − p) + B/(x − q) ----
export const pfLinear = (m, n, p, q) => ({ A: (m * p + n) / (p - q), B: (m * q + n) / (q - p) });
// (m x + n) / (x − p)² = m/(x − p) + (m p + n)/(x − p)²
export const pfRepeated = (m, n, p) => ({ A: m, B: m * p + n });

// ---- matrix types ----
export function classifyMatrix(M) {
  const [r, c] = [M.length, M[0].length];
  const flat = M.flat();
  if (flat.every((v) => v === 0)) return 'zero';
  if (r === 1) return 'row';
  if (c === 1) return 'column';
  if (r !== c) return 'other';
  const diagonal = M.every((row, i) => row.every((v, j) => i === j || v === 0));
  if (!diagonal) return 'square';
  const scalar = M.every((row, i) => row[i] === M[0][0]);
  if (!scalar) return 'diagonal';
  return M[0][0] === 1 ? 'identity' : 'scalar';
}

// TeX helpers: m x + n, and the factor x − p, written without double signs.
export const linTex = (m, n) => `${m === 1 ? '' : m === -1 ? '-' : m}x${n < 0 ? '-' : '+'}${Math.abs(n)}`;
export const facTex = (p) => (p === 0 ? 'x' : p < 0 ? `x+${-p}` : `x-${p}`);
