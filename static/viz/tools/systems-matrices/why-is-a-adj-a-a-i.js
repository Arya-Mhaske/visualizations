import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, det, mul, texNum } from './_sm-math.js';
import { adjugate, cofactorMatrix } from '../linear-algebra/_determinants-math.js';

const MATS = {
  a: { name: '[[2, 1, 0], [1, 3, 1], [0, 1, 2]]', A: [[2, 1, 0], [1, 3, 1], [0, 1, 2]] },
  b: { name: '[[1, 2, 3], [0, 4, 5], [1, 0, 6]]', A: [[1, 2, 3], [0, 4, 5], [1, 0, 6]] },
  c: { name: '[[1, 2, 3], [4, 5, 6], [7, 8, 10]]', A: [[1, 2, 3], [4, 5, 6], [7, 8, 10]] },
};
const state = { which: 'a' };
const t = (v) => texNum(Math.round(v * 1e9) / 1e9, 2);

function steps(s) {
  const A = MATS[s.which].A;
  const C = cofactorMatrix(A);
  const adj = adjugate(A);
  const D = det(A);
  const row0 = A[0].map((v, j) => `${t(v)}\\cdot(${t(C[0][j])})`).join('+');
  const cross = A[1].map((v, j) => `${t(v)}\\cdot(${t(C[0][j])})`).join('+');
  return [
    { text: 'The cofactor matrix C: each entry is a signed 2 × 2 determinant. The adjoint is its transpose.', tex: `C=${bmat(C, t)},\\quad \\operatorname{adj}A=C^{\\prime}=${bmat(adj, t)}` },
    { text: 'Entry (1, 1) of A (adj A) is row 1 of A times column 1 of adj A. That column is the cofactors of row 1. Row 1 times its own cofactors is exactly the expansion of the determinant along row 1.', tex: `${row0}=${t(D)}` },
    { text: 'Entry (1, 2) is row 2 of A times the cofactors of row 1. That is the expansion of a determinant whose first row has been replaced by row 2. Now two rows are equal, so that determinant is 0.', tex: `${cross}=0` },
    { text: 'Every diagonal entry of the product is |A|, and every off-diagonal entry is 0.', tex: `A\\,(\\operatorname{adj}A)=${bmat(mul(A, adj).map((r) => r.map((v) => Math.round(v * 1e9) / 1e9)), t)}=${t(D)}\\,I` },
    { text: Math.abs(D) < 1e-9 ? '|A| = 0 here, so the product is the zero matrix and A has no inverse.' : 'Divide by |A|: the inverse is the adjoint over the determinant.', tex: Math.abs(D) < 1e-9 ? `A\\,\\operatorname{adj}A=O` : `A^{-1}=\\dfrac{1}{${t(D)}}\\operatorname{adj}A` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), () => 'A\\,(\\operatorname{adj}A)=|A|\\,I');
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Multiply A by its adjoint' },
    { key: 'which', label: 'Matrix', options: Object.entries(MATS).map(([key, v]) => [key, v.name]) },
    { readout: [['|A|', (s) => t(det(MATS[s.which].A))]] },
  ],
  onChange: (s) => formula.update(s),
});
