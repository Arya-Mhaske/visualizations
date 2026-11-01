// Pure maths for the Inequalities and Absolute Value box. No DOM.
export const EPS = 1e-9;

// ---- multiplying by k ----
export const symbolAfter = (k) => (k > 0 ? '<' : k < 0 ? '>' : '=');

// ---- |x| against a ----
export function bandTest(x, a) {
  const inside = [x > -a, x < a]; // −a < x and x < a
  const outside = [x < -a, x > a];
  return { near: inside[0] && inside[1], far: outside[0] || outside[1], inside, outside, dist: Math.abs(x) };
}

// ---- sign charts ----
// A factor is (x − r)^power on top, or underneath when den is true. sign is the leading constant's sign.
export const CHARTS = [
  { name: '(x + 3)(x − 1)(x − 4)', sign: 1, factors: [{ r: -3 }, { r: 1 }, { r: 4 }] },
  { name: '(x − 2)²(x + 1)', sign: 1, factors: [{ r: 2, power: 2 }, { r: -1 }] },
  { name: '(x + 2) ÷ ((x − 1)(x − 3))', sign: 1, factors: [{ r: -2 }, { r: 1, den: true }, { r: 3, den: true }] },
  { name: 'x² − x − 6', sign: 1, factors: [{ r: -2 }, { r: 3 }] },
  { name: '(1 − x)(x + 2)', sign: -1, factors: [{ r: 1 }, { r: -2 }] },
];
export const factorSign = (f, x) => {
  const v = x - f.r;
  if (v === 0) return 0;
  const power = f.power || 1;
  return power % 2 === 0 ? 1 : Math.sign(v);
};
export function chartSign(chart, x) {
  let s = chart.sign;
  for (const f of chart.factors) {
    const fs = factorSign(f, x);
    if (fs === 0) return f.den ? NaN : 0;
    s *= fs;
  }
  return s;
}
// The critical points in order, with whether each is a hole (denominator)
export function criticals(chart) {
  const map = new Map();
  for (const f of chart.factors) map.set(f.r, (map.get(f.r) || false) || Boolean(f.den));
  return [...map.entries()].map(([r, hole]) => ({ r, hole })).sort((a, b) => a.r - b.r);
}
// Region signs: one test point in each region between criticals
export function regions(chart, lo = -8, hi = 8) {
  const pts = [lo, ...criticals(chart).map((p) => p.r), hi];
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const mid = (pts[i] + pts[i + 1]) / 2;
    out.push({ from: pts[i], to: pts[i + 1], mid, sign: chartSign(chart, mid) });
  }
  return out;
}
// Solution set as intervals for > 0, < 0, ≥ 0 or ≤ 0
export function solveChart(chart, want, orEqual) {
  const out = [];
  const crit = criticals(chart);
  const regs = regions(chart, -Infinity, Infinity);
  const okRegion = (r) => r.sign === want;
  regs.forEach((r) => { if (okRegion(r)) out.push({ from: r.from, to: r.to, openFrom: true, openTo: true }); });
  const solvedAt = (p) => orEqual && !p.hole;
  crit.forEach((p) => { if (solvedAt(p)) out.push({ from: p.r, to: p.r, point: true }); });
  return mergeIntervals(out);
}
function mergeIntervals(list) {
  const sorted = [...list].sort((u, v) => u.from - v.from || u.to - v.to);
  const out = [];
  for (const item of sorted) {
    const last = out[out.length - 1];
    if (last && item.from <= last.to + EPS && (!last.openTo || !item.openFrom)) {
      if (item.to > last.to || item.point) { last.to = Math.max(last.to, item.to); last.openTo = item.point ? false : item.openTo; last.point = last.from === last.to; }
    } else out.push({ ...item });
  }
  return out;
}

// ---- quadratic inequality ----
export function quadSolution(a, b, c, want, orEqual) {
  const d = b * b - 4 * a * c;
  const f = (x) => a * x * x + b * x + c;
  if (d <= 0) {
    const always = a > 0 ? (want > 0 || (d === 0 && orEqual)) : (want < 0 || (d === 0 && orEqual));
    const vertex = -b / (2 * a);
    if (d === 0) {
      if (want > 0 && a > 0) return orEqual ? [{ from: -Infinity, to: Infinity }] : [{ from: -Infinity, to: vertex, openTo: true }, { from: vertex, to: Infinity, openFrom: true }];
      if (want < 0 && a < 0) return orEqual ? [{ from: -Infinity, to: Infinity }] : [{ from: -Infinity, to: vertex, openTo: true }, { from: vertex, to: Infinity, openFrom: true }];
      return orEqual ? [{ from: vertex, to: vertex, point: true }] : [];
    }
    return (a > 0) === (want > 0) ? [{ from: -Infinity, to: Infinity }] : [];
  }
  const [r1, r2] = [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)].sort((u, v) => u - v);
  const inside = (a > 0) === (want < 0); // between the roots
  const open = !orEqual;
  return inside
    ? [{ from: r1, to: r2, openFrom: open, openTo: open }]
    : [{ from: -Infinity, to: r1, openTo: open }, { from: r2, to: Infinity, openFrom: open }];
}
export function intervalText(list) {
  if (!list.length) return 'no x';
  const n = (v) => String(Number(v.toFixed(2))).replace('-', '−');
  return list.map((i) => {
    if (i.point) return `{${n(i.from)}}`;
    if (i.from === -Infinity && i.to === Infinity) return 'all real x';
    const left = i.from === -Infinity ? '(−∞' : `${i.openFrom ? '(' : '['}${n(i.from)}`;
    const right = i.to === Infinity ? '∞)' : `${n(i.to)}${i.openTo ? ')' : ']'}`;
    return `${left}, ${right}`;
  }).join(' ∪ ');
}
export function intervalTex(list) {
  if (!list.length) return '\\varnothing';
  const n = (v) => String(Number(v.toFixed(2)));
  return list.map((i) => {
    if (i.point) return `\\{${n(i.from)}\\}`;
    if (i.from === -Infinity && i.to === Infinity) return '(-\\infty,\\infty)';
    const left = i.from === -Infinity ? '(-\\infty' : `${i.openFrom ? '(' : '['}${n(i.from)}`;
    const right = i.to === Infinity ? '\\infty)' : `${n(i.to)}${i.openTo ? ')' : ']'}`;
    return `${left},\\ ${right}`;
  }).join('\\cup ');
}

// ---- triangle inequality ----
export function triangle(a, b) {
  return { sum: Math.abs(a + b), parts: Math.abs(a) + Math.abs(b), equal: Math.abs(Math.abs(a + b) - (Math.abs(a) + Math.abs(b))) < EPS };
}

// ---- combined inequality: lo < m x + k ≤ hi ----
export function combined(lo, hi, m, k, openLo = true, openHi = false) {
  const a = (lo - k) / m;
  const b = (hi - k) / m;
  // dividing by a negative m flips the order, and flips which end is open
  return m > 0
    ? { from: a, to: b, openFrom: openLo, openTo: openHi, flipped: false }
    : { from: b, to: a, openFrom: openHi, openTo: openLo, flipped: true };
}

// ---- |m x + k| = r ----
export function absSolve(m, k, r) {
  if (r < 0) return { cases: [], centre: -k / m, spread: NaN };
  const centre = -k / m;
  const spread = r / Math.abs(m);
  const xs = r === 0 ? [centre] : [(r - k) / m, (-r - k) / m].sort((u, v) => u - v);
  return { xs, centre, spread };
}

// ---- machining tolerance ----
export const PARTS = [4.97, 4.98, 4.985, 5.0, 5.005, 5.015, 5.02, 5.021, 5.027, 4.992];
export const within = (x, nominal, tol) => Math.abs(Math.round((x - nominal) * 1e6) / 1e6) <= tol + 1e-9;
