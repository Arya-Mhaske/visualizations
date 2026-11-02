// Maths for the Inverses & Equations box (Trigonometry). Angles in radians unless a name ends in D.
export const TAU = Math.PI * 2;
export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;
const clean = (x) => (Math.abs(x) < 1e-12 ? 0 : x);
export const norm360 = (d) => clean(((d % 360) + 360) % 360);

// How many times does the line y = h cross y = f(x) on [a, b]? (counts sign changes; touches count once)
export function crossings(f, h, a, b, n = 4000) {
  const xs = [];
  let prev = f(a) - h;
  for (let i = 1; i <= n; i++) {
    const x1 = a + ((b - a) * i) / n;
    const cur = f(x1) - h;
    if ((i === 1 && prev === 0) || prev * cur < 0 || (cur === 0 && prev !== 0)) {
      let lo = a + ((b - a) * (i - 1)) / n;
      let hi = x1;
      for (let k = 0; k < 50; k++) {
        const mid = (lo + hi) / 2;
        if ((f(lo) - h) * (f(mid) - h) <= 0) hi = mid;
        else lo = mid;
      }
      const r = (lo + hi) / 2;
      if (!xs.length || Math.abs(r - xs[xs.length - 1]) > 1e-6) xs.push(r);
    }
    prev = cur;
  }
  return xs;
}

// The three basic functions and which window of width w starting at a is one-to-one, onto [-1, 1], and unbroken.
export const BASIC = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
export function windowFacts(name, a, w, n = 2000) {
  const f = BASIC[name];
  let lo = Infinity;
  let hi = -Infinity;
  let turns = 0;
  let broken = false;
  let last = null;
  let lastSlope = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + (w * i) / n;
    const y = f(x);
    const inside = i > 1 && i < n;
    if (name === 'tan' && inside && last !== null && last * y < 0 && Math.abs(y) > 10 && Math.abs(last) > 10) broken = true; // sign flip at a big value: a pole
    lo = Math.min(lo, y); hi = Math.max(hi, y);
    if (last !== null) {
      const s = Math.sign(y - last);
      if (s && lastSlope && s !== lastSlope && !broken) turns++;
      if (s) lastSlope = s;
    }
    last = y;
  }
  const covers = name === 'tan' ? !broken && lo < -50 && hi > 50 : lo <= -1 + 1e-4 && hi >= 1 - 1e-4;
  return { oneToOne: turns === 0 && !broken, covers, unbroken: !broken, contains: a <= 1e-9 && a + w >= Math.PI / 2 - 1e-9 };
}

// arcsin(sin x) and friends.
export const arcsinSin = (x) => Math.asin(Math.sin(x));
export const sinArcsin = (x) => (Math.abs(x) <= 1 ? Math.sin(Math.asin(x)) : NaN);

// The two usual branches of arcsec for |x| >= 1.
export const arcsecA = (x) => Math.acos(1 / x); // 0..pi, not pi/2
export const arcsecB = (x) => (x >= 1 ? Math.atan(Math.sqrt(x * x - 1)) : Math.PI + Math.atan(Math.sqrt(x * x - 1)));

// sin(1/x): zeros at 1/(k pi). Count of zeros with 0 < x <= w.
export const zerosUpTo = (w) => Math.floor(1 / (Math.PI * w) + 1e-9);

// Solve f(x) = k for x in [0, 360) degrees. Returns { ok, ref, sols, general } with TeX for the general solution.
export function solveBasic(name, k) {
  if ((name === 'sin' || name === 'cos') && Math.abs(k) > 1 + 1e-12) return { ok: false, ref: null, sols: [], general: [] };
  const kk = Math.max(-1, Math.min(1, k));
  const round = (x) => Math.round(x * 1e9) / 1e9;
  const ref = round(name === 'sin' ? deg(Math.asin(Math.abs(kk))) : name === 'cos' ? deg(Math.acos(Math.abs(kk))) : deg(Math.atan(Math.abs(k))));
  const t1 = (x) => Number(x.toFixed(1));
  const pos = k >= 0;
  let sols;
  let general;
  if (name === 'sin') {
    sols = pos ? [ref, 180 - ref] : [180 + ref, 360 - ref];
    general = pos ? [`${t1(ref)}^\\circ+360^\\circ k`, `${t1(180 - ref)}^\\circ+360^\\circ k`] : [`${t1(180 + ref)}^\\circ+360^\\circ k`, `${t1(360 - ref)}^\\circ+360^\\circ k`];
  } else if (name === 'cos') {
    sols = pos ? [ref, 360 - ref] : [180 - ref, 180 + ref];
    general = pos ? [`\\pm ${t1(ref)}^\\circ+360^\\circ k`] : [`\\pm ${t1(180 - ref)}^\\circ+360^\\circ k`];
  } else {
    sols = pos ? [ref, 180 + ref] : [180 - ref, 360 - ref];
    general = pos ? [`${t1(ref)}^\\circ+180^\\circ k`] : [`${t1(180 - ref)}^\\circ+180^\\circ k`];
  }
  sols = sols.map((s) => norm360(s)).sort((a, b) => a - b).filter((s, i, arr) => i === 0 || Math.abs(s - arr[i - 1]) > 1e-9);
  return { ok: true, ref, sols, general };
}

// a sin x + b cos x = R sin(x + alpha)
export const amplitudeForm = (a, b) => ({ R: Math.hypot(a, b), alphaD: deg(Math.atan2(b, a)) });
export function solveSinCos(a, b, c) {
  const { R, alphaD } = amplitudeForm(a, b);
  const k = c / R;
  if (Math.abs(k) > 1 + 1e-12) return { R, alphaD, ok: false, k, sols: [] };
  const base = solveBasic('sin', k).sols;
  const sols = base.map((s) => norm360(s - alphaD)).sort((p, q) => p - q).filter((s, i, arr) => i === 0 || Math.abs(s - arr[i - 1]) > 1e-9);
  return { R, alphaD, ok: true, k, base, sols };
}

// Intervals of [0, 2 pi] where f > g, from the crossing points.
export function aboveIntervals(f, g, a = 0, b = TAU) {
  const roots = crossings((x) => f(x) - g(x), 0, a, b);
  const pts = [a, ...roots.filter((r) => r > a + 1e-9 && r < b - 1e-9), b];
  const out = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const mid = (pts[i] + pts[i + 1]) / 2;
    if (f(mid) > g(mid)) {
      if (out.length && Math.abs(out[out.length - 1][1] - pts[i]) < 1e-9) out[out.length - 1][1] = pts[i + 1];
      else out.push([pts[i], pts[i + 1]]);
    }
  }
  return { roots, intervals: out };
}

// Exact special values for the drill: [text, number, tex].
export const SPECIALS = [
  ['0', 0], ['1/2', 0.5], ['√2/2', Math.SQRT1_2], ['√3/2', Math.sqrt(3) / 2], ['1', 1],
];
export const ANGLE_TEXT = {
  0: '0', 30: 'π/6', 45: 'π/4', 60: 'π/3', 90: 'π/2', 120: '2π/3', 135: '3π/4', 150: '5π/6', 180: 'π',
  '-30': '−π/6', '-45': '−π/4', '-60': '−π/3', '-90': '−π/2', 210: '7π/6', 225: '5π/4', 240: '4π/3', 270: '3π/2',
};
