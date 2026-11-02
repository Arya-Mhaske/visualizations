import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, mul, texNum } from './_sm-math.js';

// x = a u + b v, y = c u + d v  (matrix A)   and   u = p s + q t, v = r s + w t  (matrix B). Substitute one into the other.
const PAIRS = {
  one: { name: 'A = [[1, 2], [3, 4]], B = [[2, 0], [1, 3]]', A: [[1, 2], [3, 4]], B: [[2, 0], [1, 3]] },
  two: { name: 'A = [[2, -1], [0, 3]], B = [[1, 4], [2, 1]]', A: [[2, -1], [0, 3]], B: [[1, 4], [2, 1]] },
};
const state = { which: 'one' };
const t = (v) => texNum(v, 2);
const sg = (v) => (v < 0 ? `-${t(-v)}` : `+${t(v)}`);

function steps(s) {
  const { A, B } = PAIRS[s.which];
  const C = mul(A, B);
  return [
    { text: 'Two linear substitutions. First x and y in terms of u and v.', tex: `x=${t(A[0][0])}u${sg(A[0][1])}v,\\quad y=${t(A[1][0])}u${sg(A[1][1])}v` },
    { text: 'Then u and v in terms of s and t.', tex: `u=${t(B[0][0])}s${sg(B[0][1])}t,\\quad v=${t(B[1][0])}s${sg(B[1][1])}t` },
    { text: 'Put the second into the first, to get x and y in terms of s and t. This is what Cayley wanted a single "product" matrix for.', tex: `x=${t(A[0][0])}(${t(B[0][0])}s${sg(B[0][1])}t)${sg(A[0][1])}(${t(B[1][0])}s${sg(B[1][1])}t)` },
    { text: 'Collect the terms in s. The coefficient is (first row of A) times (first column of B), term by term. That is why the rule is row times column.', tex: `\\text{coefficient of }s=${t(A[0][0])}\\cdot${t(B[0][0])}+${t(A[0][1])}\\cdot${t(B[1][0])}=${t(C[0][0])}` },
    { text: 'The coefficient of t in x is row 1 of A with column 2 of B. Rows 2 of A give y the same way.', tex: `x=${t(C[0][0])}s${sg(C[0][1])}t,\\quad y=${t(C[1][0])}s${sg(C[1][1])}t` },
    { text: 'The matrix of the combined substitution is the product AB.', tex: `AB=${bmat(C, t)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `${bmat(PAIRS[s.which].A, t)}${bmat(PAIRS[s.which].B, t)}=${bmat(mul(PAIRS[s.which].A, PAIRS[s.which].B), t)}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Substitute one system into another' },
    { key: 'which', label: 'Matrices', options: Object.entries(PAIRS).map(([key, v]) => [key, v.name]) },
    { readout: [['Top-left entry of AB', (s) => String(mul(PAIRS[s.which].A, PAIRS[s.which].B)[0][0])]] },
  ],
  onChange: (s) => formula.update(s),
});
