import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { det, texNum } from './_sm-math.js';
import { minor } from '../linear-algebra/_determinants-math.js';

const MATS = {
  two: { name: '2 × 2', A: [[3, 1], [2, 5]] },
  three: { name: '3 × 3', A: [[2, 1, 3], [0, 4, 1], [5, -2, 1]] },
  three0: { name: '3 × 3 with a zero', A: [[1, 0, 2], [3, 1, 0], [2, 5, 4]] },
};
const state = { which: 'two' };
const n = (v) => texNum(Math.round(v * 1e9) / 1e9, 2);
const vm = (M) => `\\begin{vmatrix}${M.map((r) => r.map(n).join('&')).join('\\\\')}\\end{vmatrix}`;

function steps(s) {
  const A = MATS[s.which].A;
  if (A.length === 2) {
    return [
      { text: 'A 2 × 2 determinant: multiply down the main diagonal, then subtract the product down the other diagonal.', tex: `${vm(A)}=${n(A[0][0])}\\cdot${n(A[1][1])}-${n(A[0][1])}\\cdot${n(A[1][0])}` },
      { text: 'Finish the arithmetic.', tex: `=${n(A[0][0] * A[1][1])}-${n(A[0][1] * A[1][0])}=${n(det(A))}` },
    ];
  }
  const signs = ['+', '-', '+'];
  const list = [{ text: 'A 3 × 3 determinant: expand along the first row. Each entry is multiplied by the determinant of the 2 × 2 matrix left when its row and column are crossed out (its minor), with signs + − + .', tex: vm(A) }];
  A[0].forEach((v, j) => {
    const m = minor(A, 0, j);
    list.push({ text: `Entry ${n(v)} in column ${j + 1}: cross out row 1 and column ${j + 1}. The sign is ${signs[j] === '+' ? '+' : '−'}.`, tex: `${signs[j]}\\,${n(v)}${vm(m)}=${signs[j]}\\,${n(v)}\\cdot(${n(det(m))})=${n((j % 2 ? -1 : 1) * v * det(m))}` });
  });
  list.push({ text: 'Add the three terms.', tex: `${vm(A)}=${A[0].map((v, j) => n((j % 2 ? -1 : 1) * v * det(minor(A, 0, j)))).join('+')}=${n(det(A))}` });
  const zeroRow = A[0].includes(0);
  if (zeroRow) list.push({ text: 'A tip: a zero in the row you expand along removes a whole term. Pick the row or column with the most zeros.' });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => vm(MATS[s.which].A));
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Expand by minors' },
    { key: 'which', label: 'Matrix', options: Object.entries(MATS).map(([key, v]) => [key, v.name]) },
    { readout: [['Determinant', (s) => ({ text: n(det(MATS[s.which].A)), good: true })]] },
  ],
  onChange: (s) => formula.update(s),
});
