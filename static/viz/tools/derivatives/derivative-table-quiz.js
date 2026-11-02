import { createDrill } from '../../lib/drill.js';

// Each entry: the function, its derivative in words, and both as numbers. Every derivative here is exact.
const TABLE = [
  { f: 'eˣ', d: 'eˣ', fn: Math.exp, dn: Math.exp, xs: [0, 1, 2] },
  { f: 'aˣ with a = 2', d: '2ˣ ln 2', fn: (x) => 2 ** x, dn: (x) => 2 ** x * Math.LN2, xs: [0, 1, 3] },
  { f: 'aˣ with a = 5', d: '5ˣ ln 5', fn: (x) => 5 ** x, dn: (x) => 5 ** x * Math.log(5), xs: [0, 1, 2] },
  { f: 'ln x', d: '1/x', fn: Math.log, dn: (x) => 1 / x, xs: [1, 2, 4] },
  { f: 'log₁₀ x', d: '1/(x ln 10)', fn: Math.log10, dn: (x) => 1 / (x * Math.LN10), xs: [1, 10, 5] },
  { f: 'arcsin x', d: '1/√(1 − x²)', fn: Math.asin, dn: (x) => 1 / Math.sqrt(1 - x * x), xs: [0, 0.5, 0.6] },
  { f: 'arccos x', d: '−1/√(1 − x²)', fn: Math.acos, dn: (x) => -1 / Math.sqrt(1 - x * x), xs: [0, 0.5, 0.6] },
  { f: 'arctan x', d: '1/(1 + x²)', fn: Math.atan, dn: (x) => 1 / (1 + x * x), xs: [0, 1, 2] },
  { f: 'sinh x', d: 'cosh x', fn: Math.sinh, dn: Math.cosh, xs: [0, 1, 2] },
  { f: 'cosh x', d: 'sinh x', fn: Math.cosh, dn: Math.sinh, xs: [0, 1, 2] },
];
const WRONG = ['−eˣ', '1/x²', 'x eˣ⁻¹', '1/√(1 + x²)', 'arctan x', 'ln x', '−1/(1 + x²)', 'cosh x', '−cosh x', 'eˣ ln x'];
const shown = (v) => Number(v.toFixed(6));

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 5,
  generate(rng) {
    const row = rng.pick(TABLE);
    if (rng.next() < 0.5) {
      const others = rng.shuffle([...new Set(TABLE.map((t) => t.d).concat(WRONG))].filter((d) => d !== row.d)).slice(0, 3);
      const options = rng.shuffle([row.d, ...others]);
      return { prompt: `What is the derivative of ${row.f}?`, options, answer: options.indexOf(row.d), hint: 'Think of the graph: where is it steep, and where is it flat?', explain: `d/dx ${row.f} = ${row.d}.` };
    }
    const x = rng.pick(row.xs);
    return {
      prompt: `For f(x) = ${row.f}, find f′(${x}). Give a number to 3 decimal places.`,
      answer: shown(row.dn(x)),
      tolerance: 0.01,
      hint: `The derivative of ${row.f} is ${row.d}.`,
      explain: `f′(x) = ${row.d}, so f′(${x}) = ${shown(row.dn(x))}.`,
    };
  },
});
