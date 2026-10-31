// Pure maths for the Sets & Relations box (no DOM). Checked by catalogue/tool_tests/test_numbers_algebra_sets.py.
export const ELEMENTS = [1, 2, 3];
export const key = (a, b) => `${a}${b}`;
export const ALL_PAIRS = ELEMENTS.flatMap((a) => ELEMENTS.map((b) => [a, b]));

export const outside = (b, a) => b.filter((x) => !a.includes(x));
export const isSubset = (b, a) => outside(b, a).length === 0;

export const subsetCount = (n) => 2 ** n;
// The subset chosen by the binary digits of k, most significant digit first.
export const subsetFromCode = (names, k) => names.filter((_, i) => (k >> (names.length - 1 - i)) & 1);

export const union = (onlyA, both, onlyB) => onlyA + both + onlyB;
export const inclusionExclusion = (a, b, both) => a + b - both;

// A relation is a Set of keys such as '12' for the pair (1, 2).
export const reflexiveGaps = (r) => ELEMENTS.filter((a) => !r.has(key(a, a))).map((a) => [a, a]);
export const symmetricGaps = (r) => ALL_PAIRS.filter(([a, b]) => r.has(key(a, b)) && !r.has(key(b, a))).map(([a, b]) => [b, a]);
export function transitiveGaps(r) {
  const gaps = [];
  for (const [a, b] of ALL_PAIRS) {
    for (const c of ELEMENTS) {
      if (r.has(key(a, b)) && r.has(key(b, c)) && !r.has(key(a, c))) gaps.push([a, c]);
    }
  }
  return gaps;
}

// The smallest equivalence relation containing r: add what's missing until nothing is.
export function equivalenceClosure(relation) {
  const r = new Set(relation);
  for (;;) {
    const gaps = [...reflexiveGaps(r), ...symmetricGaps(r), ...transitiveGaps(r)];
    if (!gaps.length) return r;
    for (const [a, b] of gaps) r.add(key(a, b));
  }
}

export const PARTITIONS = [
  [[1], [2], [3]],
  [[1, 2], [3]],
  [[1, 3], [2]],
  [[2, 3], [1]],
  [[1, 2, 3]],
];
export const partitionPairs = (blocks) => blocks.flatMap((block) => block.flatMap((a) => block.map((b) => key(a, b))));

export const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
export const RULES = {
  even: ['x is even', (x) => x % 2 === 0, '2k'],
  odd: ['x is odd', (x) => x % 2 === 1, '2k - 1'],
  square: ['x is a perfect square', (x) => Number.isInteger(Math.sqrt(x)), 'k^2'],
  prime: ['x is prime', isPrime, null],
};
export const roster = (rule, limit) => {
  const out = [];
  for (let x = 1; x <= limit; x++) if (RULES[rule][1](x)) out.push(x);
  return out;
};

export const inInterval = (x, { a, b, closedA, closedB, toMinus, toPlus }) => (toMinus || x > a || (closedA && x === a))
  && (toPlus || x < b || (closedB && x === b));

export const surveyRegions = (total, tea, coffee, both) => ({
  teaOnly: tea - both, coffeeOnly: coffee - both, neither: total - (tea + coffee - both),
});
export const surveyValid = (total, tea, coffee, both) => both <= Math.min(tea, coffee) && tea + coffee - both <= total;

export const mod7 = (n) => ((n % 7) + 7) % 7;
export const related = (a, b) => mod7(a - b) === 0;
export const weekday = (first, date) => mod7(first + date - 1);
