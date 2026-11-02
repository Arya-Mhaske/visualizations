import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, mul, texNum } from './_la-math.js';

const PAIRS = {
  two: { name: '2 × 2 times 2 × 2', A: [[1, 2], [3, 4]], B: [[5, 6], [7, 8]] },
  rect: { name: '2 × 3 times 3 × 2', A: [[1, 2, 0], [0, 1, 3]], B: [[1, 0], [2, 1], [0, 4]] },
  neg: { name: 'With negatives', A: [[2, -1], [0, 3]], B: [[1, 4], [-2, 1]] },
};
const state = { which: 'two' };
const t = (M) => bmat(M, texNum);
const col = (M, j) => M.map((r) => [r[j]]);

function steps(s) {
  const { A, B } = PAIRS[s.which];
  const C = mul(A, B);
  const m = A.length;
  const n = B[0].length;
  const k = B.length;
  const entry = A[0].map((_, i) => `${texNum(A[0][i])}\\cdot${texNum(B[i][0])}`).join('+');
  const pieces = Array.from({ length: k }, (_, i) => mul(col(A, i), [B[i]]));
  return [
    { text: `A is ${m} × ${k} and B is ${k} × ${n}, so AB is ${m} × ${n}.`, tex: `A=${t(A)},\\quad B=${t(B)}` },
    { text: 'Way 1, entry by entry: each entry is a row of A times a column of B. For the top-left entry:', tex: `(AB)_{11}=${entry}=${texNum(C[0][0])}` },
    { text: 'Way 2, columns: A times each column of B. Each column of AB is a combination of the columns of A.', tex: Array.from({ length: n }, (_, j) => `A${t(col(B, j))}=${t(col(C, j))}`).join(',\\ ') },
    { text: 'Way 3, rows: each row of A times B. Each row of AB is a combination of the rows of B.', tex: Array.from({ length: m }, (_, i) => `${t([A[i]])}B=${t([C[i]])}`).join(',\\ ') },
    { text: 'Way 4, a sum of (column of A) × (row of B), one piece for each inner index.', tex: `${pieces.map((p) => t(p)).join('+')}` },
    { text: 'All four ways add up to the same matrix.', tex: `AB=${t(C)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `AB=${t(mul(PAIRS[s.which].A, PAIRS[s.which].B))}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Four ways, one answer' },
    { key: 'which', label: 'Matrices', options: Object.entries(PAIRS).map(([key, v]) => [key, v.name]) },
    { readout: [['Size of AB', (s) => `${PAIRS[s.which].A.length} × ${PAIRS[s.which].B[0].length}`]] },
  ],
  onChange: (s) => formula.update(s),
});
