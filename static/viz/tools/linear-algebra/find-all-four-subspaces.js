import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, texNum, transpose } from './_la-math.js';
import { MATRICES, subspaces } from './_four-subspaces-math.js';

const state = { which: 'rank2' };
const tex = (M) => bmat(M, texNum);
const basisTex = (vs) => (vs.length ? vs.map((v) => bmat(v.map((x) => [x]), texNum)).join(',\\ ') : '\\text{only } \\mathbf 0 \\text{ (empty basis)}');

function steps(s) {
  const A = MATRICES[s.which].A;
  const q = subspaces(A);
  const { m, n, r } = q;
  return [
    { text: 'Reduce A to R. Everything below comes from R and its pivots.', tex: `A=${tex(A)},\\ \\ R=${tex(q.R)}` },
    { text: `Column space C(A), in ${m}-dimensional space: the pivot columns of A itself (not of R).`, tex: `C(A):\\ ${basisTex(q.column)}\\quad(\\dim=${r})` },
    { text: `Nullspace N(A), in ${n}-dimensional space: one special solution for each free column.`, tex: `N(A):\\ ${basisTex(q.null)}\\quad(\\dim=${n - r})` },
    { text: `Row space C(Aᵀ), in ${n}-dimensional space: the non-zero rows of R.`, tex: `C(A^{\\mathsf T}):\\ ${basisTex(q.row)}\\quad(\\dim=${r})` },
    { text: `Left nullspace N(Aᵀ), in ${m}-dimensional space: solve Aᵀy = 0.`, tex: `N(A^{\\mathsf T}):\\ ${basisTex(q.left)}\\quad(\\dim=${m - r})` },
    { text: 'Check the dimensions: each pair fills its space.', tex: `r+(n-r)=${n},\\quad r+(m-r)=${m}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `A=${tex(MATRICES[s.which].A)},\\quad A^{\\mathsf T}=${tex(transpose(MATRICES[s.which].A))}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Find all four' },
    { key: 'which', label: 'Matrix', options: Object.entries(MATRICES).map(([key, v]) => [key, v.name]) },
    { readout: [
      ['dim C(A), dim N(A)', (s) => { const q = subspaces(MATRICES[s.which].A); return `${q.r}, ${q.n - q.r}`; }],
      ['dim C(Aᵀ), dim N(Aᵀ)', (s) => { const q = subspaces(MATRICES[s.which].A); return `${q.r}, ${q.m - q.r}`; }],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
