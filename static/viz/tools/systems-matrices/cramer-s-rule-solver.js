import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { det, num, texNum, vecTex, bmat, matVec } from './_sm-math.js';
import { cramer, replaceColumn } from '../linear-algebra/_determinants-math.js';

const SYSTEMS = {
  two: { name: '2 variables', A: [[3, 2], [1, -1]], b: [7, 1], vars: ['x', 'y'] },
  three: { name: '3 variables', A: [[2, 1, 0], [1, 3, 1], [0, 1, 2]], b: [3, 5, 3], vars: ['x', 'y', 'z'] },
  three2: { name: '3 variables, again', A: [[1, 1, 1], [2, -1, 1], [1, 2, -1]], b: [6, 3, 2], vars: ['x', 'y', 'z'] },
};
const state = { which: 'two' };
const n = (v) => texNum(Math.round(v * 1e9) / 1e9, 3);
const vm = (M) => `\\begin{vmatrix}${M.map((r) => r.map(n).join('&')).join('\\\\')}\\end{vmatrix}`;

function steps(s) {
  const { A, b, vars } = SYSTEMS[s.which];
  const D = det(A);
  const list = [{ text: 'Write the coefficient matrix and the right-hand side. Cramer\'s rule needs det A ≠ 0.', tex: `A=${bmat(A, n)},\\ \\mathbf b=${vecTex(b, n)},\\quad D=${vm(A)}=${n(D)}` }];
  if (Math.abs(D) < 1e-9) { list.push({ text: 'D = 0, so Cramer\'s rule cannot be used: the system has no unique solution.' }); return list; }
  const x = cramer(A, b);
  vars.forEach((v, j) => {
    const B = replaceColumn(A, j, b);
    list.push({ text: `For ${v}, replace column ${j + 1} of A by b and take the determinant.`, tex: `D_{${v}}=${vm(B)}=${n(det(B))},\\qquad ${v}=\\dfrac{D_{${v}}}{D}=\\dfrac{${n(det(B))}}{${n(D)}}=${n(x[j])}` });
  });
  list.push({ text: 'Check by multiplying A by the solution.', tex: `A\\mathbf x=${vecTex(matVec(A, x).map((v) => Math.round(v * 1e9) / 1e9), n)}=\\mathbf b` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), () => 'x_j=\\dfrac{D_j}{D}');
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Solve with determinants' },
    { key: 'which', label: 'System', options: Object.entries(SYSTEMS).map(([key, v]) => [key, v.name]) },
    { readout: [
      ['D', (s) => num(det(SYSTEMS[s.which].A))],
      ['Solution', (s) => cramer(SYSTEMS[s.which].A, SYSTEMS[s.which].b).map((v) => num(v)).join(', ')],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
