import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, texNum, transpose } from './_sm-math.js';

const MATS = {
  a: { name: '[[1, 2, 3], [4, 5, 6], [7, 8, 10]]', A: [[1, 2, 3], [4, 5, 6], [7, 8, 10]] },
  b: { name: '[[2, -1, 0], [3, 1, 4], [5, 2, -2]]', A: [[2, -1, 0], [3, 1, 4], [5, 2, -2]] },
  c: { name: '[[3, 0], [8, -1]]', A: [[3, 0], [8, -1]] },
};
const state = { which: 'a' };
const t = (v) => texNum(v, 2);
const half = (X, Y, sign) => X.map((r, i) => r.map((v, j) => (v + sign * Y[i][j]) / 2));

function steps(s) {
  const A = MATS[s.which].A;
  const At = transpose(A);
  const S = half(A, At, 1);
  const K = half(A, At, -1);
  const sum = S.map((r, i) => r.map((v, j) => v + K[i][j]));
  return [
    { text: 'A square matrix A and its mirror image A′ (the transpose).', tex: `A=${bmat(A, t)},\\quad A^{\\prime}=${bmat(At, t)}` },
    { text: 'Average A with its mirror. Averaging a matrix with its own mirror gives something that equals its own mirror: symmetric.', tex: `P=\\tfrac12(A+A^{\\prime})=${bmat(S, t)}` },
    { text: 'Take half the difference instead. When you mirror it, every entry changes sign: skew-symmetric. Its diagonal must be 0, because a number that equals its own negative is 0.', tex: `Q=\\tfrac12(A-A^{\\prime})=${bmat(K, t)}` },
    { text: 'Check the diagonal of Q.', tex: `\\text{diagonal of }Q=${K.map((r, i) => t(r[i])).join(',\\ ')}` },
    { text: 'Add them. The mirror images cancel in the difference and double in the sum, so P + Q gives A back.', tex: `P+Q=${bmat(sum, t)}=A` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), () => 'A=\\underbrace{\\tfrac12(A+A^{\\prime})}_{\\text{symmetric}}+\\underbrace{\\tfrac12(A-A^{\\prime})}_{\\text{skew-symmetric}}');
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Split a matrix' },
    { key: 'which', label: 'Matrix', options: Object.entries(MATS).map(([key, v]) => [key, v.name]) },
    { readout: [
      ['P is symmetric?', (s) => { const A = MATS[s.which].A; const P = half(A, transpose(A), 1); return { text: JSON.stringify(P) === JSON.stringify(transpose(P)) ? 'yes' : 'no', good: true }; }],
      ['Diagonal of Q is all 0?', (s) => { const A = MATS[s.which].A; const K = half(A, transpose(A), -1); return { text: K.every((r, i) => r[i] === 0) ? 'yes' : 'no', good: true }; }],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
