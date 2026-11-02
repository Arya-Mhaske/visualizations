import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { apply2, bmat, eig2, texNum, vecTex } from './_la-math.js';

const state = { a: 4, b: 1, c: 2, d: 3 };
const M = (s) => [[s.a, s.b], [s.c, s.d]];
const n = (v) => texNum(v, 3);
const fx = (v) => fixed(v, 3);

function steps(s) {
  const A = M(s);
  const e = eig2(A);
  const t = s.a + s.d;
  const D = s.a * s.d - s.b * s.c;
  const list = [
    { text: 'For a 2 × 2 matrix only two numbers matter: the trace (the sum of the diagonal) and the determinant.', tex: `\\text{trace}=${s.a}+${s.d}=${t},\\qquad \\det=${s.a}\\cdot${s.d}-${s.b}\\cdot${s.c}=${D}` },
    { text: 'The eigenvalues are the roots of λ² − (trace) λ + (det) = 0. Their sum is the trace and their product is the determinant.', tex: `\\lambda^2-${t}\\lambda+${D}=0` },
  ];
  if (!e.real) {
    list.push({ text: 'The discriminant is negative, so there are no real eigenvalues: the matrix turns every vector (it has a rotation in it).', tex: `\\lambda=${fx(e.re)}\\pm${fx(e.im)}\\,i` });
    return list;
  }
  list.push({ text: 'Solve the quadratic.', tex: `\\lambda=\\dfrac{${t}\\pm\\sqrt{${t}^2-4(${D})}}{2}=${fx(e.l[0])},\\ ${fx(e.l[1])}` });
  e.l.forEach((l, i) => {
    const v = e.v[i];
    list.push(v
      ? { text: `For λ = ${fx(l)}, find a vector that A − λI sends to zero. A x then equals λ x.`, tex: `\\mathbf x_{${i + 1}}\\propto${vecTex(v, n)},\\quad A\\mathbf x_{${i + 1}}=${vecTex(apply2(A, v), n)}=${fx(l)}\\mathbf x_{${i + 1}}` }
      : { text: `λ = ${fx(l)} is a repeated root and the matrix has only one eigenvector direction (it is defective).`, tex: `\\lambda=${fx(l)}` });
  });
  list.push({ text: 'Check: the sum and product of the eigenvalues give back the trace and determinant.', tex: `${fx(e.l[0])}+${fx(e.l[1])}=${fx(e.l[0] + e.l[1])}=${t},\\quad ${fx(e.l[0])}\\times${fx(e.l[1])}=${fx(e.l[0] * e.l[1])}=${D}` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `A=${bmat(M(s), n)}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a 2 × 2 matrix' },
    { key: 'a', label: 'a', min: -3, max: 5, step: 1, format: (v) => `${v}` },
    { key: 'b', label: 'b', min: -3, max: 5, step: 1, format: (v) => `${v}` },
    { key: 'c', label: 'c', min: -3, max: 5, step: 1, format: (v) => `${v}` },
    { key: 'd', label: 'd', min: -3, max: 5, step: 1, format: (v) => `${v}` },
    { readout: [
      ['Trace, det', (s) => `${s.a + s.d}, ${s.a * s.d - s.b * s.c}`],
      ['Eigenvalues', (s) => { const e = eig2(M(s)); return e.real ? e.l.map(fx).join(', ') : `${fx(e.re)} ± ${fx(e.im)}i`; }],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
