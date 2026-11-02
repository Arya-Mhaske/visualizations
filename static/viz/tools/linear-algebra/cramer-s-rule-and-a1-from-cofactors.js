import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, det, inverse, matVec, num, texNum, vecTex } from './_la-math.js';
import { PRESETS, adjugate, cofactorMatrix, cramer, replaceColumn } from './_determinants-math.js';

const SETS = { ...PRESETS };
delete SETS.c;
const state = { which: 'a' };
const set = (s) => SETS[s.which];
const n = (v) => texNum(v, 2);

function steps(s) {
  const { A, b } = set(s);
  const D = det(A);
  const x = cramer(A, b);
  const list = [
    { text: 'The system A x = b. Cramer\'s rule needs det A ≠ 0.', tex: `A=${bmat(A, n)},\\ \\mathbf b=${vecTex(b, n)},\\ \\det A=${n(D)}` },
  ];
  x.forEach((xi, j) => list.push({ text: `Replace column ${j + 1} of A by b. The ratio of the two determinants is x${j + 1}.`, tex: `x_{${j + 1}}=\\dfrac{\\det B_{${j + 1}}}{\\det A}=\\dfrac{${n(det(replaceColumn(A, j, b)))}}{${n(D)}}=${n(xi)}` }));
  list.push({ text: 'Check that A x really equals b.', tex: `A${vecTex(x, n)}=${vecTex(matVec(A, x).map((v) => Math.round(v * 1e9) / 1e9), n)}` });
  list.push({ text: 'The inverse from cofactors: first the matrix of cofactors C (each entry is a signed smaller determinant).', tex: `C=${bmat(cofactorMatrix(A), n)}` });
  list.push({ text: 'Transpose it and divide by det A. The transpose of C is the adjugate.', tex: `A^{-1}=\\dfrac{1}{\\det A}C^{\\mathsf T}=\\dfrac{1}{${n(D)}}${bmat(adjugate(A), n)}` });
  list.push({ text: 'That is the same inverse that Gauss–Jordan finds.', tex: `A^{-1}=${bmat(inverse(A), n)}` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), () => 'x_j=\\dfrac{\\det B_j}{\\det A},\\qquad A^{-1}=\\dfrac{C^{\\mathsf T}}{\\det A}');
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Solve with determinants' },
    { key: 'which', label: 'System', options: Object.entries(SETS).map(([key, v]) => [key, v.name]) },
    { readout: [
      ['det A', (s) => num(det(set(s).A))],
      ['Solution x', (s) => cramer(set(s).A, set(s).b).map((v) => num(v)).join(', ')],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
