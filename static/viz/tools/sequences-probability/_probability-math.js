// Pure maths for the Probability box (no DOM).
export const FACES = [1, 2, 3, 4, 5, 6];
export const EVENTS6 = {
  even: ['Even', (f) => f % 2 === 0],
  high: ['5 or 6', (f) => f >= 5],
  low: ['1 or 2', (f) => f <= 2],
  prime: ['Prime', (f) => [2, 3, 5].includes(f)],
};
// A die whose face 6 is `w` times as heavy as each other face.
export const loaded = (w) => FACES.map((f) => (f === 6 ? w : 1) / (w + 5));
export const normalise = (weights) => {
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((x) => x / sum);
};
export const unionCount = (a, b, both) => a + b - both;
export const noneSix = (n) => 5 ** n;
export const atLeastOne = (n) => 6 ** n - 5 ** n;
// Ways to get exactly k sixes in n dice.
export const choose = (n, k) => {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
};
export const exactly = (n, k) => choose(n, k) * 5 ** (n - k);
export const sharedBirthday = (n) => {
  let none = 1;
  for (let i = 0; i < n; i++) none *= (365 - i) / 365;
  return 1 - none;
};
export const pairs = (n) => (n * (n - 1)) / 2;
// Running share of heads in a seeded run; returns an array where entry i is the share after i + 1 flips.
export function runShares(rng, p, n) {
  const out = [];
  let heads = 0;
  for (let i = 0; i < n; i++) {
    if (rng.next() < p) heads++;
    out.push(heads / (i + 1));
  }
  return out;
}
