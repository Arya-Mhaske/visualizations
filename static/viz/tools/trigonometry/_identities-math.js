// Pure maths for the Identities box. Angles in degrees unless a name says radians. No DOM.
export const rad = (d) => (d * Math.PI) / 180;
export const sinD = (d) => Math.sin(rad(d));
export const cosD = (d) => Math.cos(rad(d));
export const tanD = (d) => Math.tan(rad(d));

// ---- Pythagorean triangles: scale the unit-circle triangle by 1, 1/cos or 1/sin ----
// kind 'one': legs cos, sin, hyp 1.  'tan': legs 1, tan, hyp sec.  'cot': legs cot, 1, hyp csc.
export function scaled(kind, theta) {
  const c = cosD(theta);
  const s = sinD(theta);
  if (kind === 'tan') return { k: 1 / c, adj: 1, opp: s / c, hyp: 1 / c };
  if (kind === 'cot') return { k: 1 / s, adj: c / s, opp: 1, hyp: 1 / s };
  return { k: 1, adj: c, opp: s, hyp: 1 };
}

// ---- identity or equation: pairs of two sides ----
const PI2 = Math.PI * 2;
export const PAIRS = [
  { name: 'sin²x + cos²x = 1', kind: 'identity', f: (x) => Math.sin(x) ** 2 + Math.cos(x) ** 2, g: () => 1 },
  { name: 'tan x cos x = sin x', kind: 'identity', f: (x) => Math.tan(x) * Math.cos(x), g: (x) => Math.sin(x) },
  { name: 'sin 2x = 2 sin x cos x', kind: 'identity', f: (x) => Math.sin(2 * x), g: (x) => 2 * Math.sin(x) * Math.cos(x) },
  { name: 'cos²x = (1 + cos 2x)/2', kind: 'identity', f: (x) => Math.cos(x) ** 2, g: (x) => (1 + Math.cos(2 * x)) / 2 },
  { name: 'sin x = cos x', kind: 'equation', f: (x) => Math.sin(x), g: (x) => Math.cos(x) },
  { name: 'sin x = 1/2', kind: 'equation', f: (x) => Math.sin(x), g: () => 0.5 },
  { name: 'sin 2x = sin x', kind: 'equation', f: (x) => Math.sin(2 * x), g: (x) => Math.sin(x) },
  { name: 'cos x = x', kind: 'equation', f: (x) => Math.cos(x), g: (x) => x },
];
// Where two curves meet on [lo, hi]: sign changes of f − g, found by bisection. Poles are skipped.
export function crossings(f, g, lo, hi, n = 2400) {
  const d = (x) => f(x) - g(x);
  const out = [];
  let x0 = lo;
  let d0 = d(x0);
  for (let i = 1; i <= n; i++) {
    const x1 = lo + ((hi - lo) * i) / n;
    const d1 = d(x1);
    if (Number.isFinite(d0) && Number.isFinite(d1) && (d0 === 0 || d0 * d1 < 0) && Math.abs(d1 - d0) < 1) {
      let a = x0;
      let b = x1;
      for (let k = 0; k < 50; k++) {
        const m = (a + b) / 2;
        if (d(a) * d(m) <= 0) b = m; else a = m;
      }
      out.push((a + b) / 2);
    }
    x0 = x1;
    d0 = d1;
  }
  return out;
}
// Share of sample points where the two sides agree to 1e-9
export function agreement(f, g, lo, hi, n = 1200) {
  let same = 0;
  let total = 0;
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * (i + 0.5)) / (n + 1);
    const a = f(x);
    const b = g(x);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    total += 1;
    if (Math.abs(a - b) < 1e-9) same += 1;
  }
  return total ? same / total : 0;
}

// ---- cos(A − B) by a chord ----
export function chordSquared(A, B) {
  return (cosD(A) - cosD(B)) ** 2 + (sinD(A) - sinD(B)) ** 2;
}
export const chordFromDifference = (A, B) => (cosD(A - B) - 1) ** 2 + sinD(A - B) ** 2;

// ---- sin(A + B) by stacked triangles ----
export function stacked(A, B) {
  const q = [cosD(B) * cosD(A), cosD(B) * sinD(A)];
  const p = [q[0] - sinD(B) * sinD(A), q[1] + sinD(B) * cosD(A)];
  return { q, p, low: cosD(B) * sinD(A), high: sinD(B) * cosD(A) };
}

// ---- half angles ----
export const normalise = (t) => ((t % 360) + 360) % 360;
export function halfAngle(theta) {
  const value = (1 - cosD(theta)) / 2;
  const half = theta / 2;
  return { value, root: Math.sqrt(value), sign: sinD(half) >= -1e-12 ? 1 : -1, actual: sinD(half), otherHalf: half + 180 };
}

// ---- products to sums ----
export const product = (f1, f2, t) => Math.cos(f1 * t) * Math.cos(f2 * t);
export const sumForm = (f1, f2, t) => (Math.cos((f1 - f2) * t) + Math.cos((f1 + f2) * t)) / 2;

// ---- M sin t + N cos t ----
export function singleSine(M, N) {
  return { R: Math.hypot(M, N), phi: (Math.atan2(N, M) * 180) / Math.PI };
}

// ---- the verifier's identities: every step is a function of x ----
const sx = Math.sin;
const cx = Math.cos;
export const VERIFY = [
  {
    name: '(1 + tan²x) cos²x = 1',
    target: { tex: '1', f: () => 1 },
    steps: [
      { tex: '(1+\\tan^2x)\\cos^2x', f: (x) => (1 + Math.tan(x) ** 2) * cx(x) ** 2, note: 'The left side as given.' },
      { tex: '\\sec^2x\\cos^2x', f: (x) => cx(x) ** 2 / cx(x) ** 2, note: '1 + tan²x = sec²x (the scaled triangle).' },
      { tex: '\\dfrac{1}{\\cos^2x}\\cos^2x', f: () => 1, note: 'sec x means 1 ÷ cos x.' },
      { tex: '1', f: () => 1, note: 'The cos²x cancel.' },
    ],
    wrong: { at: 1, tex: '\\cos^2x+\\tan^2x', f: (x) => cx(x) ** 2 + Math.tan(x) ** 2, note: 'Wrong: cos²x multiplies both terms, not just the 1.' },
  },
  {
    name: '(sin x + cos x)² − 1 = sin 2x',
    target: { tex: '\\sin 2x', f: (x) => sx(2 * x) },
    steps: [
      { tex: '(\\sin x+\\cos x)^2-1', f: (x) => (sx(x) + cx(x)) ** 2 - 1, note: 'The left side as given.' },
      { tex: '\\sin^2x+2\\sin x\\cos x+\\cos^2x-1', f: (x) => sx(x) ** 2 + 2 * sx(x) * cx(x) + cx(x) ** 2 - 1, note: 'Expand the square, with its middle term.' },
      { tex: '1+2\\sin x\\cos x-1', f: (x) => 2 * sx(x) * cx(x), note: 'sin²x + cos²x = 1.' },
      { tex: '2\\sin x\\cos x', f: (x) => 2 * sx(x) * cx(x), note: 'The 1 and −1 cancel.' },
      { tex: '\\sin 2x', f: (x) => sx(2 * x), note: 'The double-angle formula, read backwards.' },
    ],
    wrong: { at: 1, tex: '\\sin^2x+\\cos^2x-1', f: (x) => sx(x) ** 2 + cx(x) ** 2 - 1, note: 'Wrong: (a + b)² is not a² + b². The middle term is missing.' },
  },
  {
    name: 'sin x/(1 + cos x) + (1 + cos x)/sin x = 2 csc x',
    target: { tex: '2\\csc x', f: (x) => 2 / sx(x) },
    steps: [
      { tex: '\\dfrac{\\sin x}{1+\\cos x}+\\dfrac{1+\\cos x}{\\sin x}', f: (x) => sx(x) / (1 + cx(x)) + (1 + cx(x)) / sx(x), note: 'The left side as given.' },
      { tex: '\\dfrac{\\sin^2x+(1+\\cos x)^2}{\\sin x(1+\\cos x)}', f: (x) => (sx(x) ** 2 + (1 + cx(x)) ** 2) / (sx(x) * (1 + cx(x))), note: 'Common denominator.' },
      { tex: '\\dfrac{\\sin^2x+1+2\\cos x+\\cos^2x}{\\sin x(1+\\cos x)}', f: (x) => (sx(x) ** 2 + 1 + 2 * cx(x) + cx(x) ** 2) / (sx(x) * (1 + cx(x))), note: 'Expand (1 + cos x)².' },
      { tex: '\\dfrac{2+2\\cos x}{\\sin x(1+\\cos x)}', f: (x) => (2 + 2 * cx(x)) / (sx(x) * (1 + cx(x))), note: 'sin²x + cos²x = 1.' },
      { tex: '\\dfrac{2}{\\sin x}', f: (x) => 2 / sx(x), note: 'Cancel (1 + cos x).' },
      { tex: '2\\csc x', f: (x) => 2 / sx(x), note: 'csc x means 1 ÷ sin x.' },
    ],
    wrong: { at: 2, tex: '\\dfrac{\\sin^2x+1+\\cos^2x}{\\sin x(1+\\cos x)}', f: (x) => (sx(x) ** 2 + 1 + cx(x) ** 2) / (sx(x) * (1 + cx(x))), note: 'Wrong: (1 + cos x)² is 1 + 2 cos x + cos²x, not 1 + cos²x.' },
  },
];
// The largest gap between a step and the target on a safe grid (poles skipped)
export function maxGap(f, g, lo = 0.2, hi = 2.9, n = 200) {
  let worst = 0;
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n;
    const a = f(x);
    const b = g(x);
    if (Number.isFinite(a) && Number.isFinite(b)) worst = Math.max(worst, Math.abs(a - b));
  }
  return worst;
}
export function stepsFor(identity, upto, useWrong) {
  const list = identity.steps.slice(0, upto + 1);
  if (useWrong && upto >= identity.wrong.at) {
    list[identity.wrong.at] = identity.wrong;
  }
  return list;
}

// ---- all six from one ----
export const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
const SIGNS = { 1: [1, 1], 2: [-1, 1], 3: [-1, -1], 4: [1, -1] };
// fn is the given function; the triple's first leg is its numerator. Returns exact fractions and signs.
export function allSix(fn, triple, quadrant) {
  const [a, b, h] = triple;
  const [sx_, sy] = SIGNS[quadrant];
  const opp = fn === 'cos' ? b : a;
  const adj = fn === 'cos' ? a : b;
  const x = sx_ * adj;
  const y = sy * opp;
  const r = h;
  const f = (n, d) => ({ n, d });
  return { x, y, r, opp, adj, sin: f(y, r), cos: f(x, r), tan: f(y, x), csc: f(r, y), sec: f(r, x), cot: f(x, y) };
}
export const fractionText = ({ n, d }) => {
  if (d < 0) { n = -n; d = -d; }
  return d === 1 ? `${n}`.replace('-', '−') : `${n}/${d}`.replace('-', '−');
};
export const fractionTex = ({ n, d }) => {
  const neg = n * d < 0;
  const body = Math.abs(d) === 1 ? `${Math.abs(n)}` : `\\dfrac{${Math.abs(n)}}{${Math.abs(d)}}`;
  return neg ? `-${body}` : body;
};
export const givenValue = (fn, triple, quadrant) => allSix(fn, triple, quadrant)[fn];
export const QUADRANT_SIGNS = SIGNS;
export const TWO_PI = PI2;
