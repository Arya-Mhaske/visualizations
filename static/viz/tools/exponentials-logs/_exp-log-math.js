// Pure maths for the whole exponentials-logs subject. No DOM.
export const LN2 = Math.LN2;
export const logb = (b, x) => Math.log(x) / Math.log(b);

// (1 + r/n)^n, the year-end amount of 1 rupee at rate r compounded n times.
export const compound = (r, n) => (1 + r / n) ** n;

// Partial sum 1/0! + 1/1! + ... + 1/k!
export function eSum(k) {
  let sum = 0;
  let term = 1;
  for (let j = 0; j <= k; j++) {
    sum += term;
    term /= j + 1;
  }
  return sum;
}

// Bisection for a sign change of f between lo and hi.
export function bisect(f, lo, hi, rounds = 80) {
  let a = lo;
  let b = hi;
  const fa = f(a);
  for (let i = 0; i < rounds; i++) {
    const m = (a + b) / 2;
    if ((f(m) <= 0) === (fa <= 0)) a = m; else b = m;
  }
  return (a + b) / 2;
}

// Every place f changes sign on [lo, hi], found by a fine scan then bisection.
export function crossings(f, lo, hi, steps = 4000) {
  const out = [];
  let x0 = lo;
  let y0 = f(lo);
  for (let i = 1; i <= steps; i++) {
    const x1 = lo + ((hi - lo) * i) / steps;
    const y1 = f(x1);
    if (Number.isFinite(y0) && Number.isFinite(y1) && y0 !== 0 && y0 * y1 <= 0) out.push(bisect(f, x0, x1));
    x0 = x1;
    y0 = y1;
  }
  return out;
}

// Digits of a^n: the exact count (BigInt) and the log10 reading floor(n log10 a) + 1.
export function powerDigits(a, n) {
  const text = (BigInt(a) ** BigInt(n)).toString();
  const L = n * Math.log10(a);
  return { exact: text.length, byLog: Math.floor(L) + 1, L, lead: text.slice(0, 4), text };
}

// Where 2^x stops being beaten by x^p: the last x at which x^p >= 2^x.
export function lastLead(p) {
  let last = 1;
  for (let x = 1.01; x < 400; x += 0.005) if (p * Math.log2(x) >= x) last = x;
  return last;
}

// Squeeze for 2^sqrt2: truncate sqrt 2 to k decimals; the true value lies between 2^low and 2^(low + 10^-k).
export function squeeze(k, base = 2) {
  const step = 10 ** -k;
  const low = Math.floor(Math.SQRT2 / step + 1e-9) * step;
  return { low, high: low + step, fLow: base ** low, fHigh: base ** (low + step) };
}

// Finance
export const rupee = (x) => `₹${Math.round(x).toLocaleString('en-IN')}`;
export const effective = (rate, n) => (n === Infinity ? Math.exp(rate) - 1 : (1 + rate / n) ** n - 1);
export const doublingYears = (rate) => Math.LN2 / Math.log(1 + rate);
export const emi = (P, annualRate, months) => {
  const i = annualRate / 12;
  return i === 0 ? P / months : (P * i * (1 + i) ** months) / ((1 + i) ** months - 1);
};
export const annuityFV = (deposit, annualRate, months) => {
  const i = annualRate / 12;
  return i === 0 ? deposit * months : (deposit * ((1 + i) ** months - 1)) / i;
};
export const balanceAfter = (P, annualRate, months, k) => {
  const i = annualRate / 12;
  const pay = emi(P, annualRate, months);
  return i === 0 ? P - pay * k : P * (1 + i) ** k - (pay * ((1 + i) ** k - 1)) / i;
};

// Areas under 1/x
export const areaTo = (c) => Math.log(c);
// Rectangle rule on [1, c] for 1/x with N pieces. 1/x falls, so left ends give the upper sum and right ends the lower.
export function rectangles(c, N, rule = 'lower') {
  const w = (c - 1) / N;
  const out = [];
  for (let i = 0; i < N; i++) {
    const x0 = 1 + i * w;
    const x1 = x0 + w;
    const x = rule === 'upper' ? x0 : rule === 'lower' ? x1 : (x0 + x1) / 2;
    out.push({ x0, x1, h: 1 / x });
  }
  return out;
}
export const rectSum = (c, N, rule) => rectangles(c, N, rule).reduce((s, r) => s + r.h * (r.x1 - r.x0), 0);

// The same on any interval [a, b] with a < b.
export function rectsOn(a, b, N, rule = 'lower') {
  const w = (b - a) / N;
  return Array.from({ length: N }, (_, i) => {
    const x0 = a + i * w;
    const x1 = x0 + w;
    const x = rule === 'upper' ? x0 : rule === 'lower' ? x1 : (x0 + x1) / 2;
    return { x0, x1, h: 1 / x };
  });
}
export const sumOn = (a, b, N, rule) => rectsOn(a, b, N, rule).reduce((s, r) => s + r.h * (r.x1 - r.x0), 0);

// 1 - 1/2 + 1/3 - ... to N terms
export function altHarmonic(N) {
  let s = 0;
  for (let k = 1; k <= N; k++) s += (k % 2 ? 1 : -1) / k;
  return s;
}

// Logistic growth
export const logistic = (t, r, K, P0) => K / (1 + ((K - P0) / P0) * Math.exp(-r * t));
// Newton cooling
export const cooling = (t, T0, Ts, k) => Ts + (T0 - Ts) * Math.exp(-k * t);

// Catenary through two supports at height h above the lowest point, half-span L: a (cosh(L/a) - 1) = h.
export function catenaryA(L, h) {
  return bisect((a) => h - a * (Math.cosh(L / a) - 1), 0.02, 1e5);
}

// Straight-line fit r^2 for points [x, y]
export function rSquaredLine(points) {
  const n = points.length;
  const mx = points.reduce((s, p) => s + p[0], 0) / n;
  const my = points.reduce((s, p) => s + p[1], 0) / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const [x, y] of points) {
    sxx += (x - mx) ** 2;
    sxy += (x - mx) * (y - my);
    syy += (y - my) ** 2;
  }
  return syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);
}
