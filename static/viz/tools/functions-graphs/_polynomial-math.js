// Pure maths for the Polynomial Functions box. A polynomial is its coefficients, highest power first. No DOM.
export const evalP = (c, x) => c.reduce((acc, k) => acc * x + k, 0);
export const degree = (c) => c.length - 1;
export function mulP(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; }));
  return out;
}
// lead · ∏ (x − r) for each real root r (repeat a root for multiplicity)
export const fromRoots = (roots, lead = 1) => roots.reduce((p, r) => mulP(p, [1, -r]), [lead]);
// Synthetic division by (x − c): returns the quotient coefficients and the remainder
export function synth(c, root) {
  const q = [];
  let carry = 0;
  c.forEach((k, i) => { carry = i === 0 ? k : k + carry * root; q.push(carry); });
  return { q: q.slice(0, -1), r: q[q.length - 1], row: q };
}
export function signChanges(c) {
  const s = c.filter((k) => k !== 0).map(Math.sign);
  return s.slice(1).filter((v, i) => v !== s[i]).length;
}
export const flipOdd = (c) => c.map((k, i) => ((c.length - 1 - i) % 2 ? -k : k)); // P(−x)
export function divisors(n) {
  const out = [];
  for (let d = 1; d <= Math.abs(n); d++) if (n % d === 0) out.push(d);
  return out;
}
// All complex roots, by the Durand–Kerner method. Returns [re, im] pairs sorted by re.
export function allRoots(c) {
  const n = degree(c);
  const lead = c[0];
  const monic = c.map((k) => k / lead);
  const cm = ([a, b], [x, y]) => [a * x - b * y, a * y + b * x];
  const dv = ([a, b], [x, y]) => { const d = x * x + y * y; return [(a * x + b * y) / d, (b * x - a * y) / d]; };
  const ev = (z) => monic.reduce((acc, k) => { const m = cm(acc, z); return [m[0] + k, m[1]]; }, [0, 0]);
  let z = Array.from({ length: n }, (_, i) => cm([0.4, 0.9], [Math.cos((2 * Math.PI * i) / n), Math.sin((2 * Math.PI * i) / n)]).map((v) => v * (1 + Math.max(...monic.map(Math.abs)) / 2)));
  z = z.map((p, i) => cm(p, [1 + 0.05 * i, 0.02 * i]));
  for (let it = 0; it < 500; it++) {
    z = z.map((zi, i) => {
      let den = [1, 0];
      z.forEach((zj, j) => { if (j !== i) den = cm(den, [zi[0] - zj[0], zi[1] - zj[1]]); });
      const step = dv(ev(zi), den);
      return [zi[0] - step[0], zi[1] - step[1]];
    });
  }
  return z.map(([a, b]) => [Math.abs(a) < 1e-9 ? 0 : a, Math.abs(b) < 1e-7 ? 0 : b]).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
}
export const realRootsOf = (c) => allRoots(c).filter((z) => z[1] === 0).map((z) => z[0]);
// Turning points of a polynomial: sign changes of its derivative
export function derivative(c) { return c.slice(0, -1).map((k, i) => k * (c.length - 1 - i)); }
export function turningPoints(c, lo = -10, hi = 10, n = 4000) {
  const d = derivative(c);
  let count = 0;
  let prev = Math.sign(evalP(d, lo));
  for (let i = 1; i <= n; i++) {
    const s = Math.sign(evalP(d, lo + ((hi - lo) * i) / n));
    if (s !== 0 && prev !== 0 && s !== prev) count++;
    if (s !== 0) prev = s;
  }
  return count;
}
// Text and TeX for a polynomial
export function showP(c, v = 'x') {
  const terms = [];
  c.forEach((k, i) => {
    const p = c.length - 1 - i;
    if (k === 0) return;
    const a = Math.abs(k);
    const coef = a === 1 && p > 0 ? '' : String(Number(a.toFixed(3)));
    const body = p === 0 ? coef : p === 1 ? `${coef}${v}` : `${coef}${v}^${p}`;
    terms.push([k < 0, body]);
  });
  if (!terms.length) return '0';
  return terms.map(([neg, b], i) => (i === 0 ? (neg ? '-' : '') + b : `${neg ? '-' : '+'}${b}`)).join('');
}
