import { createStepper } from '../../lib/stepper.js';
import { fixed } from '../../lib/format.js';
import { exact } from './_ig.js';
import { EX, integrand } from './_subst.js';

const DU = { cosx2: '2x\\,dx', expx3: '3x^2\\,dx', esin: '\\cos x\\,dx', lnx: '\\dfrac{dx}{x}' };
const BACK = { cosx2: '\\sin(x^2)', expx3: 'e^{x^3}', esin: 'e^{\\sin x}', lnx: '\\dfrac{(\\ln x)^2}{2}' };
const state = { k: 'cosx2', p: 1 };
const bOf = (s) => EX[s.k].x0 + s.p * (EX[s.k].x1 - EX[s.k].x0);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  controls: [
    { title: 'Choose an integral' },
    { key: 'k', label: 'Integrand', options: Object.entries(EX).map(([k, v]) => [k, v.name]) },
    { key: 'p', label: 'Check from start to b', min: 0.2, max: 1, step: 0.05, format: (v) => fixed(EX[state.k].x0 + v * (EX[state.k].x1 - EX[state.k].x0), 2) },
  ],
  steps: (s) => {
    const e = EX[s.k];
    const b = bOf(s);
    const area = exact((x) => integrand(e, x), e.x0, b);
    return [
      { text: 'The integral to find:', tex: `\\int ${e.tex}\\,dx` },
      { text: 'Look for an inner function whose derivative also appears. Let u be that inner function.', tex: `u=${e.u}` },
      { text: 'Differentiate u. The factor that was left over is exactly du.', tex: `du=${DU[s.k]}` },
      { text: 'Rewrite the whole integral in u. Not an x is left.', tex: `\\int ${e.fTex}\\,du` },
      { text: 'Integrate in u.', tex: `${e.FoTex}+C` },
      { text: 'Put x back: replace u by its expression.', tex: `${BACK[s.k]}+C` },
      { text: `Check with limits. From x = ${fixed(e.x0, 2)} to ${fixed(b, 2)}, u runs from ${fixed(e.g(e.x0), 3)} to ${fixed(e.g(b), 3)}. The area under the integrand is ${fixed(area, 4)}, and F(u₂) − F(u₁) is ${fixed(e.Fo(e.g(b)) - e.Fo(e.g(e.x0)), 4)}.` },
    ];
  },
});
