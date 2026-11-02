// Discrete distributions for random-variables-expectation. A distribution is { name, xs, ps } with exact probabilities.
import { frac } from '../../lib/format.js';

const dice = [1, 2, 3, 4, 5, 6];
export const DISTS = {
  sum2: { name: 'two dice, sum', xs: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], ps: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map((n) => n / 36) },
  one: { name: 'one fair die', xs: dice, ps: dice.map(() => 1 / 6) },
  loaded: { name: 'a loaded die', xs: dice, ps: [0.1, 0.1, 0.1, 0.1, 0.1, 0.5] },
  max2: { name: 'two dice, larger', xs: dice, ps: [1, 3, 5, 7, 9, 11].map((n) => n / 36) },
};
export const dist = (key) => DISTS[key];
export const mean = (d) => d.xs.reduce((a, x, i) => a + x * d.ps[i], 0);
export const ex2 = (d) => d.xs.reduce((a, x, i) => a + x * x * d.ps[i], 0);
export const variance = (d) => ex2(d) - mean(d) ** 2;
// E[(X − m)²] for a trial centre m; equals Var + (m − μ)².
export const spreadAbout = (d, m) => d.xs.reduce((a, x, i) => a + (x - m) ** 2 * d.ps[i], 0);
export const torque = (d, pivot) => d.xs.reduce((a, x, i) => a + (x - pivot) * d.ps[i], 0);

// Text for a number that is probably a small fraction: 35/6 or 5.833
export function fr(x, maxDen = 72) {
  const f = frac(x, maxDen);
  if (f && Math.abs(f.p / f.q - x) < 1e-9) return f.q === 1 ? String(f.p) : `${f.p}/${f.q}`;
  return String(Math.round(x * 1000) / 1000);
}

// Outcomes for counting experiments: each outcome has a label and its value of X.
export const EXPERIMENTS = {
  sum: { name: 'Two dice: sum', cols: 6, outcomes: dice.flatMap((a) => dice.map((b) => ({ text: `${a}${b}`, x: a + b }))) },
  larger: { name: 'Two dice: larger', cols: 6, outcomes: dice.flatMap((a) => dice.map((b) => ({ text: `${a}${b}`, x: Math.max(a, b) }))) },
  diff: { name: 'Two dice: |a − b|', cols: 6, outcomes: dice.flatMap((a) => dice.map((b) => ({ text: `${a}${b}`, x: Math.abs(a - b) }))) },
  heads: {
    name: 'Three tosses: heads',
    cols: 4,
    outcomes: ['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT'].map((t) => ({ text: t, x: [...t].filter((ch) => ch === 'H').length })),
  },
};
