import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, mul, texNum, transpose } from './_sm-math.js';

const PAIRS = {
  one: { name: '2 × 3 and 3 × 2', A: [[1, 2, 0], [3, 1, 4]], B: [[2, 1], [0, 3], [1, 1]] },
  two: { name: 'Two 2 × 2 matrices', A: [[1, 2], [3, 4]], B: [[0, 1], [5, 2]] },
};
const state = { which: 'one', i: 1, j: 2 };
const t = (v) => texNum(v, 2);

function steps(s) {
  const { A, B } = PAIRS[s.which];
  const AB = mul(A, B);
  const T = transpose(AB);
  const BtAt = mul(transpose(B), transpose(A));
  const i = Math.min(s.i, T.length) - 1;
  const j = Math.min(s.j, T[0].length) - 1;
  const row = A[j];
  const col = B.map((r) => r[i]);
  return [
    { text: 'Multiply A and B, then flip the answer across its diagonal.', tex: `(AB)^{\\prime}=${bmat(T, t)}` },
    { text: `Look at one entry of (AB)′: row ${i + 1}, column ${j + 1}. Flipping means it is the entry of AB in row ${j + 1}, column ${i + 1}.`, tex: `\\big((AB)^{\\prime}\\big)_{${i + 1}${j + 1}}=(AB)_{${j + 1}${i + 1}}` },
    { text: `That entry is (row ${j + 1} of A) times (column ${i + 1} of B).`, tex: `=${row.map((v, k) => `${t(v)}\\cdot${t(col[k])}`).join('+')}=${t(AB[j][i])}` },
    { text: 'Now read the same sum with the roles swapped. Row i of B′ is column i of B, and column j of A′ is row j of A. So it is (row i of B′) times (column j of A′), which is an entry of B′A′.', tex: `(B^{\\prime}A^{\\prime})_{${i + 1}${j + 1}}=${t(BtAt[i][j])}` },
    { text: 'Every entry matches, so the order reverses.', tex: `B^{\\prime}A^{\\prime}=${bmat(BtAt, t)}=(AB)^{\\prime}` },
    { text: 'The other order, A′B′, is a different matrix (here it even has a different size, or different entries). Only B′A′ matches.', tex: `A^{\\prime}B^{\\prime}=${bmat(mul(transpose(A), transpose(B)), t)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), () => "(AB)^{\\prime}=B^{\\prime}A^{\\prime}");
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Transpose a product' },
    { key: 'which', label: 'Matrices', options: Object.entries(PAIRS).map(([key, v]) => [key, v.name]) },
    { key: 'i', label: 'Entry: row of (AB)′', min: 1, max: 2, step: 1, format: (n) => `${n}` },
    { key: 'j', label: 'Entry: column of (AB)′', min: 1, max: 2, step: 1, format: (n) => `${n}` },
    { readout: [['(AB)′ equals B′A′?', (s) => { const { A, B } = PAIRS[s.which]; const ok = JSON.stringify(transpose(mul(A, B))) === JSON.stringify(mul(transpose(B), transpose(A))); return { text: ok ? 'yes' : 'no', good: ok }; }]] },
  ],
  onChange: (s) => formula.update(s),
});
