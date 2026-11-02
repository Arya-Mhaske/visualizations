import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { apply2, bmat, eig2, mul2, transpose, vecTex } from './_la-math.js';

const PRESETS = {
  a: { name: '[[3, 0], [4, 5]]', A: [[3, 0], [4, 5]] },
  b: { name: '[[1, 1], [0, 1]]', A: [[1, 1], [0, 1]] },
  c: { name: '[[2, 1], [1, 2]]', A: [[2, 1], [1, 2]] },
};
const state = { which: 'a' };
const f = (v) => fixed(v, 3);
const M = (A) => bmat(A, f);

function parts(A) {
  const AtA = mul2(transpose(A), A);
  const e = eig2(AtA);
  const sigma = e.l.map((l) => Math.sqrt(Math.max(l, 0)));
  const u = e.v.map((v, i) => apply2(A, v).map((x) => x / sigma[i]));
  return { AtA, e, sigma, u };
}

function steps(s) {
  const A = PRESETS[s.which].A;
  const { AtA, e, sigma, u } = parts(A);
  return [
    { text: 'Multiply AᵀA. It is symmetric, so it has perpendicular eigenvectors and non-negative eigenvalues.', tex: `A^{\\mathsf T}A=${M(AtA)}` },
    { text: 'The unit eigenvectors of AᵀA are the right singular vectors v₁, v₂. Its eigenvalues are σ².', tex: `\\mathbf v_1=${vecTex(e.v[0], f)},\\ \\mathbf v_2=${vecTex(e.v[1], f)},\\quad \\sigma_1^2=${f(e.l[0])},\\ \\sigma_2^2=${f(e.l[1])}` },
    { text: 'The singular values are the square roots.', tex: `\\sigma_1=${f(sigma[0])},\\quad \\sigma_2=${f(sigma[1])}` },
    { text: 'Each u is A v divided by σ. That makes u unit length, and the u\'s come out perpendicular too.', tex: `\\mathbf u_1=\\dfrac{A\\mathbf v_1}{\\sigma_1}=${vecTex(u[0], f)},\\ \\mathbf u_2=${vecTex(u[1], f)},\\quad \\mathbf u_1\\cdot\\mathbf u_2=${f(u[0][0] * u[1][0] + u[0][1] * u[1][1])}` },
    { text: 'Those u\'s are also the eigenvectors of AAᵀ. Put the pieces together: A v = σ u for each pair.', tex: `A\\mathbf v_1=${vecTex(apply2(A, e.v[0]), f)}=\\sigma_1\\mathbf u_1,\\quad A\\mathbf v_2=${vecTex(apply2(A, e.v[1]), f)}=\\sigma_2\\mathbf u_2` },
    { text: 'So A = U Σ Vᵀ.', tex: `A=${M(mul2(mul2([[u[0][0], u[1][0]], [u[0][1], u[1][1]]], [[sigma[0], 0], [0, sigma[1]]]), [[e.v[0][0], e.v[0][1]], [e.v[1][0], e.v[1][1]]]))}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `A=${bmat(PRESETS[s.which].A, (v) => fixed(v, 0))}=U\\Sigma V^{\\mathsf T}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Find the singular vectors' },
    { key: 'which', label: 'Matrix', options: Object.entries(PRESETS).map(([key, v]) => [key, v.name]) },
    { readout: [['σ₁, σ₂', (s) => parts(PRESETS[s.which].A).sigma.map(f).join(', ')]] },
  ],
  onChange: (s) => formula.update(s),
});
