// Pure maths for the Linear equations and formulas box (no DOM).
export const BALANCE = {
  a: { a: 2, b: 3, c: 1, d: 7 },
  b: { a: 3, b: 2, c: 1, d: 8 },
  c: { a: 4, b: 0, c: 2, d: 10 },
};
// a x + b = c x + d: the value of x that balances it.
export const solution = (p) => (p.d - p.b) / (p.a - p.c);
export const sides = (p, x) => ({ L: p.a * x + p.b, R: p.c * x + p.d });
export function classify(m1, k1, m2, k2) {
  if (m1 === m2) return k1 === k2 ? 'every' : 'none';
  return 'one';
}
export const crossX = (m1, k1, m2, k2) => (k2 - k1) / (m1 - m2);
export const FRACS = {
  a: {
    name: 'x/(x−3) = 3/(x−3) + 2', tex: '\\dfrac{x}{x-3}=\\dfrac{3}{x-3}+2', L: (x) => x / (x - 3), R: (x) => 3 / (x - 3) + 2,
    mult: 'x − 3', mf: (x) => x - 3, cleared: 'x = 3 + 2(x − 3)', roots: [3],
  },
  b: {
    name: 'x²/(x−2) = 4/(x−2)', tex: '\\dfrac{x^2}{x-2}=\\dfrac{4}{x-2}', L: (x) => (x * x) / (x - 2), R: (x) => 4 / (x - 2),
    mult: 'x − 2', mf: (x) => x - 2, cleared: 'x² = 4', roots: [2, -2],
  },
  c: {
    name: '1/(x−1) + 1/(x+1) = 2x/(x²−1)', tex: '\\dfrac{1}{x-1}+\\dfrac{1}{x+1}=\\dfrac{2x}{x^2-1}', L: (x) => 1 / (x - 1) + 1 / (x + 1), R: (x) => (2 * x) / (x * x - 1),
    mult: 'x² − 1', mf: (x) => x * x - 1, cleared: '(x + 1) + (x − 1) = 2x, so 0 = 0 for every x', roots: [-2, -1, 0, 1, 2],
  },
};
export const survives = (f, r) => Number.isFinite(f.L(r)) && Number.isFinite(f.R(r)) && Math.abs(f.L(r) - f.R(r)) < 1e-9;
// Formula rearrangement: one entry per (formula, target). `solve` rebuilds the target from the base values.
export const REARR = [
  { formula: 'v = u + at', target: 'a', base: { u: 2, a: 3, t: 4, v: 14 }, solve: (b) => (b.v - b.u) / b.t,
    steps: ['v = u + at', 'v - u = at', 'a = \\dfrac{v-u}{t}'], notes: ['start', 'subtract u from both sides', 'divide both sides by t'] },
  { formula: 'v = u + at', target: 't', base: { u: 2, a: 3, t: 4, v: 14 }, solve: (b) => (b.v - b.u) / b.a,
    steps: ['v = u + at', 'v - u = at', 't = \\dfrac{v-u}{a}'], notes: ['start', 'subtract u from both sides', 'divide both sides by a'] },
  { formula: 'A = P(1 + rt)', target: 'P', base: { P: 5000, r: 0.08, t: 2, A: 5800 }, solve: (b) => b.A / (1 + b.r * b.t),
    steps: ['A = P(1+rt)', 'P = \\dfrac{A}{1+rt}'], notes: ['start', 'divide both sides by (1 + rt)'] },
  { formula: 'A = P(1 + rt)', target: 'r', base: { P: 5000, r: 0.08, t: 2, A: 5800 }, solve: (b) => (b.A - b.P) / (b.P * b.t),
    steps: ['A = P(1+rt)', '\\dfrac{A}{P} = 1+rt', '\\dfrac{A}{P}-1 = rt', 'r = \\dfrac{A-P}{Pt}'], notes: ['start', 'divide both sides by P', 'subtract 1 from both sides', 'divide both sides by t'] },
  { formula: 'C = 5/9 (F − 32)', target: 'F', base: { F: 212, C: 100 }, solve: (b) => (9 * b.C) / 5 + 32,
    steps: ['C = \\dfrac59(F-32)', '\\dfrac95 C = F-32', 'F = \\dfrac95 C+32'], notes: ['start', 'multiply both sides by 9/5', 'add 32 to both sides'] },
  { formula: 's = ut + ½at²', target: 'a', base: { u: 3, t: 4, a: 2, s: 28 }, solve: (b) => (2 * (b.s - b.u * b.t)) / (b.t * b.t),
    steps: ['s = ut+\\tfrac12 at^2', 's-ut = \\tfrac12 at^2', '2(s-ut) = at^2', 'a = \\dfrac{2(s-ut)}{t^2}'], notes: ['start', 'subtract ut from both sides', 'multiply both sides by 2', 'divide both sides by t²'] },
  { formula: 's = ut + ½at²', target: 'u', base: { u: 3, t: 4, a: 2, s: 28 }, solve: (b) => (b.s - 0.5 * b.a * b.t * b.t) / b.t,
    steps: ['s = ut+\\tfrac12 at^2', 's-\\tfrac12 at^2 = ut', 'u = \\dfrac{s-\\tfrac12 at^2}{t}'], notes: ['start', 'subtract ½at² from both sides', 'divide both sides by t'] },
];
// Mixing two strengths: the result is the weighted average.
export const blend = (s1, q1, s2, q2) => (s1 * q1 + s2 * q2) / (q1 + q2);
// Two trains. 'towards': A and B start D km apart and approach; 'chase': B is D km ahead going the same way.
export function meet(D, vA, vB, mode) {
  const rel = mode === 'towards' ? vA + vB : vA - vB;
  return rel > 0 ? D / rel : null;
}
export const simple = (P, r, t) => (P * r * t) / 100;
// Split X between rates r1 and r2 (per cent, one year) to earn interest I: amount at r1.
export const splitAt = (X, r1, r2, I) => (I * 100 - X * r2) / (r1 - r2);
export const together = (a, b) => (a * b) / (a + b);
export const withDrain = (a, b, c) => 1 / (1 / a + 1 / b - 1 / c);
