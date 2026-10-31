// Pure maths for the Conditional Probability & Bayes box (no DOM).
// Checked by catalogue/tool_tests/test_sequences_probability_bayes.py.
export const OUTCOMES = [];
for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) OUTCOMES.push([i, j]);

export const EVENTS = {
  sum7: ['Sum is 7', (i, j) => i + j === 7],
  sum8plus: ['Sum is 8 or more', (i, j) => i + j >= 8],
  first6: ['First die is 6', (i) => i === 6],
  first1: ['First die is 1', (i) => i === 1],
  firstEven: ['First die is even', (i) => i % 2 === 0],
  secondEven: ['Second die is even', (i, j) => j % 2 === 0],
  doubles: ['Doubles', (i, j) => i === j],
};
export const count = (test) => OUTCOMES.filter(([i, j]) => test(i, j)).length;
export const countBoth = (a, b) => count((i, j) => a(i, j) && b(i, j));
export const independent = (a, b) => countBoth(a, b) * 36 === count(a) * count(b);
export const exclusive = (a, b) => countBoth(a, b) === 0;

export const total = (shares, rates) => shares.reduce((sum, share, i) => sum + share * rates[i], 0);
export const posterior = (shares, rates, i) => (shares[i] * rates[i]) / total(shares, rates);

export const testPositive = (prevalence, detect, falsePositive) => prevalence * detect + (1 - prevalence) * falsePositive;
export const illGivenPositive = (prevalence, detect, falsePositive) => posterior([prevalence, 1 - prevalence], [detect, falsePositive], 0);

// P(colours in this order) drawing without putting back, e.g. order 'RB'.
export function drawChance(red, blue, order) {
  let [r, b, p] = [red, blue, 1];
  for (const colour of order) {
    const left = r + b;
    p *= (colour === 'R' ? r : b) / left;
    if (colour === 'R') r--; else b--;
  }
  return p;
}
