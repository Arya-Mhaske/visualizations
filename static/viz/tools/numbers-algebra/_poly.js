// Pure maths for the Polynomials & factoring box. Polynomials are coefficient lists, highest power first.
export const evalP = (p, x) => p.reduce((t, c) => t * x + c, 0);
export function tex(p) {
  const n = p.length - 1;
  const terms = p.map((c, i) => [c, n - i]).filter(([c]) => c !== 0).map(([c, k], i) => {
    const mag = Math.abs(c);
    const body = k === 0 ? `${mag}` : `${mag === 1 ? '' : mag}x${k > 1 ? `^{${k}}` : ''}`;
    return `${c < 0 ? '-' : i ? '+' : ''}${body}`;
  });
  return terms.join('') || '0';
}
// Synthetic division by (x - r): returns the quotient coefficients and the remainder.
export function synthetic(p, r) {
  const b = [p[0]];
  for (let i = 1; i < p.length; i++) b.push(p[i] + b[i - 1] * r);
  return { q: b.slice(0, -1), rem: b[b.length - 1], b };
}
// Long division of p by d (both coefficient lists); returns each step.
export function longDivision(p, d) {
  let rem = p.slice();
  const q = [];
  const steps = [];
  while (rem.length >= d.length) {
    const c = rem[0] / d[0];
    const k = rem.length - d.length;
    q.push(c);
    const sub = d.map((x) => x * c).concat(Array(k).fill(0));
    rem = rem.map((x, i) => x - (sub[i] ?? 0)).slice(1);
    while (rem.length > 1 && rem[0] === 0 && rem.length >= d.length) rem = rem.slice(1);
    steps.push({ c, k, sub, rem: rem.slice() });
  }
  return { q, steps, rem };
}
// (mx + p)(nx + q) with m n = a, p q = c, m q + n p = b (positive integers), or null.
export function tileFactors(a, b, c) {
  for (let m = 1; m <= a; m++) {
    if (a % m) continue;
    const n = a / m;
    for (let p = 1; p <= c; p++) {
      if (c % p) continue;
      const q = c / p;
      if (m * q + n * p === b) return { m, n, p, q };
    }
  }
  return null;
}
export const GROUPS = [
  { title: 'x³ + 2x² + 3x + 6', p: [1, 2, 3, 6], steps: ['x^3+2x^2+3x+6', '=(x^3+2x^2)+(3x+6)', '=x^2(x+2)+3(x+2)', '=(x^2+3)(x+2)'], notes: ['start', 'group in pairs', 'take out the common factor of each pair', 'the bracket (x + 2) is common: take it out'], f: [(x) => x ** 3 + 2 * x * x + 3 * x + 6, (x) => (x * x + 3) * (x + 2)] },
  { title: '6x² + 13x + 6', p: [6, 13, 6], steps: ['6x^2+13x+6', '=6x^2+4x+9x+6', '=(6x^2+4x)+(9x+6)', '=2x(3x+2)+3(3x+2)', '=(2x+3)(3x+2)'], notes: ['start', 'split 13x as 4x + 9x, since 4 × 9 = 6 × 6', 'group in pairs', 'take out the common factors', 'take out the common bracket'], f: [(x) => 6 * x * x + 13 * x + 6, (x) => (2 * x + 3) * (3 * x + 2)] },
  { title: 'x³ − x² + 4x − 4', p: [1, -1, 4, -4], steps: ['x^3-x^2+4x-4', '=(x^3-x^2)+(4x-4)', '=x^2(x-1)+4(x-1)', '=(x^2+4)(x-1)'], notes: ['start', 'group in pairs', 'take out the common factors', 'take out (x − 1)'], f: [(x) => x ** 3 - x * x + 4 * x - 4, (x) => (x * x + 4) * (x - 1)] },
  { title: '2x³ − 3x² − 8x + 12', p: [2, -3, -8, 12], steps: ['2x^3-3x^2-8x+12', '=(2x^3-3x^2)-(8x-12)', '=x^2(2x-3)-4(2x-3)', '=(x^2-4)(2x-3)', '=(x-2)(x+2)(2x-3)'], notes: ['start', 'group in pairs (watch the sign)', 'take out the common factors', 'take out (2x − 3)', 'x² − 4 factors again'], f: [(x) => 2 * x ** 3 - 3 * x * x - 8 * x + 12, (x) => (x - 2) * (x + 2) * (2 * x - 3)] },
];
