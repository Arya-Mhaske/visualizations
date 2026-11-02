import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, det, inverse, texNum } from './_sm-math.js';
import { adjugate, cofactorMatrix, minor } from '../linear-algebra/_determinants-math.js';

const MATS = {
  a: { name: '[[2, 1, 0], [1, 3, 1], [0, 1, 2]]', A: [[2, 1, 0], [1, 3, 1], [0, 1, 2]] },
  b: { name: '[[1, 2, 3], [0, 4, 5], [1, 0, 6]]', A: [[1, 2, 3], [0, 4, 5], [1, 0, 6]] },
  c: { name: '[[1, -1, 2], [0, 2, 1], [3, 1, 0]]', A: [[1, -1, 2], [0, 2, 1], [3, 1, 0]] },
};
const state = { which: 'a', i: 1, j: 1 };
const n = (v) => texNum(Math.round(v * 1e9) / 1e9, 3);

function steps(s) {
  const A = MATS[s.which].A;
  const D = det(A);
  const M = A.map((r, i) => r.map((_, j) => det(minor(A, i, j))));
  const C = cofactorMatrix(A);
  const [i, j] = [s.i - 1, s.j - 1];
  const sign = (i + j) % 2 ? -1 : 1;
  return [
    { text: `The minor M${s.i}${s.j} of one entry: cross out its row and column, then take the determinant of what is left. Here, for the entry in row ${s.i}, column ${s.j}:`, tex: `M_{${s.i}${s.j}}=\\begin{vmatrix}${minor(A, i, j).map((r) => r.map(n).join('&')).join('\\\\')}\\end{vmatrix}=${n(M[i][j])}` },
    { text: 'The minors of every entry make the matrix of minors.', tex: `[M_{ij}]=${bmat(M, n)}` },
    { text: `The cofactor adds a sign: A${s.i}${s.j} = (−1)^(${s.i}+${s.j}) M${s.i}${s.j}. Signs follow a chessboard of + and −.`, tex: `A_{${s.i}${s.j}}=(${sign > 0 ? '+' : '-'}1)\\cdot${n(M[i][j])}=${n(C[i][j])}` },
    { text: 'All the cofactors, then their transpose, give the adjoint.', tex: `\\operatorname{adj}A=[A_{ij}]^{\\prime}=${bmat(adjugate(A), n)}` },
    { text: Math.abs(D) < 1e-9 ? '|A| = 0, so A has no inverse.' : 'The inverse is the adjoint divided by |A|.', tex: Math.abs(D) < 1e-9 ? '|A|=0' : `|A|=${n(D)},\\quad A^{-1}=\\dfrac{\\operatorname{adj}A}{|A|}=${bmat(inverse(A), n)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), () => 'A^{-1}=\\dfrac{\\operatorname{adj}A}{|A|}');
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Build the adjoint' },
    { key: 'which', label: 'Matrix', options: Object.entries(MATS).map(([key, v]) => [key, v.name]) },
    { key: 'i', label: 'Entry: row', min: 1, max: 3, step: 1, format: (v) => `${v}` },
    { key: 'j', label: 'Entry: column', min: 1, max: 3, step: 1, format: (v) => `${v}` },
    { readout: [['|A|', (s) => n(det(MATS[s.which].A))]] },
  ],
  onChange: (s) => formula.update(s),
});
