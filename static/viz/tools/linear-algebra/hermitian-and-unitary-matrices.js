import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { cabs, cadd, cconj, cmul, ctex } from './_la-math.js';

const R2 = Math.SQRT1_2;
const PRESETS = {
  herm: { name: 'Hermitian', A: [[[2, 0], [3, -1]], [[3, 1], [5, 0]]] },
  unit: { name: 'Unitary', A: [[[R2, 0], [0, R2]], [[0, R2], [R2, 0]]] },
  both: { name: 'Plain complex', A: [[[1, 0], [0, 1]], [[2, 0], [3, 0]]] },
};
const state = { which: 'herm' };
const tex = (M) => `\\begin{bmatrix}${M.map((r) => r.map(ctex).join('&')).join('\\\\')}\\end{bmatrix}`;
const hermitian = (A) => A[0].map((_, j) => A.map((r) => cconj(r[j])));
const mul = (A, B) => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => cadd(s, cmul(v, B[k][j])), [0, 0])));
const close = (A, B) => A.every((r, i) => r.every((v, j) => Math.hypot(v[0] - B[i][j][0], v[1] - B[i][j][1]) < 1e-9));
const I = [[[1, 0], [0, 0]], [[0, 0], [1, 0]]];
// eigenvalues of a complex 2 × 2 by the quadratic formula (complex square root)
function eigenvalues(A) {
  const t = cadd(A[0][0], A[1][1]);
  const D = cadd(cmul(A[0][0], A[1][1]), cmul([-1, 0], cmul(A[0][1], A[1][0])));
  const disc = cadd(cmul(t, t), [-4 * D[0], -4 * D[1]]);
  const r = cabs(disc);
  const sq = [Math.sqrt((r + disc[0]) / 2), Math.sign(disc[1] || 1) * Math.sqrt(Math.max((r - disc[0]) / 2, 0))];
  return [[(t[0] + sq[0]) / 2, (t[1] + sq[1]) / 2], [(t[0] - sq[0]) / 2, (t[1] - sq[1]) / 2]];
}

function steps(s) {
  const A = PRESETS[s.which].A;
  const H = hermitian(A);
  const ev = eigenvalues(A);
  const isH = close(A, H);
  const isU = close(mul(H, A), I);
  return [
    { text: 'A complex matrix. Entries may be complex numbers.', tex: `A=${tex(A)}` },
    { text: 'The conjugate transpose Aᴴ flips across the diagonal and also changes every i to −i. It plays the role of the transpose.', tex: `A^{\\mathsf H}=${tex(H)}` },
    { text: isH ? 'A equals Aᴴ, so A is Hermitian: the complex version of symmetric.' : 'A is not equal to Aᴴ, so A is not Hermitian.', tex: isH ? 'A=A^{\\mathsf H}' : 'A\\ne A^{\\mathsf H}' },
    { text: 'Multiply AᴴA. If it is the identity the columns are orthonormal (using conjugates in the dot product), and A is unitary: the complex version of orthogonal.', tex: `A^{\\mathsf H}A=${tex(mul(H, A))}` },
    { text: isU ? 'AᴴA = I, so A is unitary.' : 'AᴴA is not the identity, so A is not unitary.', tex: isU ? 'A^{\\mathsf H}=A^{-1}' : 'A^{\\mathsf H}\\ne A^{-1}' },
    { text: 'Eigenvalues tell the story: a Hermitian matrix has real eigenvalues, a unitary matrix has eigenvalues of absolute value 1.', tex: `\\lambda_1=${ctex(ev[0])},\\ \\lambda_2=${ctex(ev[1])},\\quad |\\lambda_1|=${cabs(ev[0]).toFixed(3)},\\ |\\lambda_2|=${cabs(ev[1]).toFixed(3)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), () => 'A^{\\mathsf H}=\\bar A^{\\mathsf T}:\\quad A=A^{\\mathsf H}\\ \\text{(Hermitian)},\\qquad A^{\\mathsf H}A=I\\ \\text{(unitary)}');
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a complex matrix' },
    { key: 'which', label: 'Matrix', options: Object.entries(PRESETS).map(([key, v]) => [key, v.name]) },
    { readout: [
      ['Hermitian?', (s) => { const ok = close(PRESETS[s.which].A, hermitian(PRESETS[s.which].A)); return { text: ok ? 'yes' : 'no', good: ok }; }],
      ['Unitary?', (s) => { const ok = close(mul(hermitian(PRESETS[s.which].A), PRESETS[s.which].A), I); return { text: ok ? 'yes' : 'no', good: ok }; }],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
