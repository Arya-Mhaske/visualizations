// Pure maths for the Sequences, AP, GP and Statistics boxes (no DOM).
export const fibs = (n, a = 1, b = 1) => {
  const out = [a, b];
  while (out.length < n) out.push(out[out.length - 1] + out[out.length - 2]);
  return out.slice(0, n);
};
export const apTerm = (a, d, n) => a + (n - 1) * d;
export const apSum = (a, d, n) => (n * (2 * a + (n - 1) * d)) / 2;
export const gpTerm = (a, r, n) => a * r ** (n - 1);
export const gpSum = (a, r, n) => (r === 1 ? a * n : (a * (1 - r ** n)) / (1 - r));
export const mean = (x) => x.reduce((t, v) => t + v, 0) / x.length;
export const variance = (x) => x.reduce((t, v) => t + (v - mean(x)) ** 2, 0) / x.length;
export const sd = (x) => Math.sqrt(variance(x));
export const meanDev = (x, c) => x.reduce((t, v) => t + Math.abs(v - c), 0) / x.length;
export const median = (x) => { const s = [...x].sort((p, q) => p - q); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
