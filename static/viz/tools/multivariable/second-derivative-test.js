import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// At a critical point, D = f_xx f_yy − f_xy². D > 0 with f_xx > 0: minimum. D > 0 with f_xx < 0: maximum. D < 0: saddle. D = 0: no verdict.
export const PRESETS = {
  a: { name: 'x³ + y³ − 3xy', tex: 'x^3+y^3-3xy', crit: [[0, 0], [1, 1]], fxx: (x) => 6 * x, fyy: (x, y) => 6 * y, fxy: () => -3, fxTex: '3x^2-3y', fyTex: '3y^2-3x' },
  b: { name: 'x⁴ + y⁴ − 4xy + 1', tex: 'x^4+y^4-4xy+1', crit: [[0, 0], [1, 1], [-1, -1]], fxx: (x) => 12 * x * x, fyy: (x, y) => 12 * y * y, fxy: () => -4, fxTex: '4x^3-4y', fyTex: '4y^3-4x' },
  c: { name: '3xy − x³ − y³', tex: '3xy-x^3-y^3', crit: [[0, 0], [1, 1]], fxx: (x) => -6 * x, fyy: (x, y) => -6 * y, fxy: () => 3, fxTex: '3y-3x^2', fyTex: '3x-3y^2' },
  d: { name: 'x⁴ + y⁴', tex: 'x^4+y^4', crit: [[0, 0]], fxx: (x) => 12 * x * x, fyy: (x, y) => 12 * y * y, fxy: () => 0, fxTex: '4x^3', fyTex: '4y^3' },
};
const state = { fn: 'a' };
export function classify(P, [x, y]) {
  const [a, b, c] = [P.fxx(x, y), P.fxy(x, y), P.fyy(x, y)];
  const D = a * c - b * b;
  const verdict = D > 0 ? (a > 0 ? 'local minimum' : 'local maximum') : D < 0 ? 'saddle point' : 'test fails: D = 0';
  return { fxx: a, fxy: b, fyy: c, D, verdict };
}

function steps(s) {
  const P = PRESETS[s.fn];
  const list = [
    { text: 'Set both first partial derivatives to zero.', tex: `f_x=${P.fxTex}=0,\\quad f_y=${P.fyTex}=0` },
    { text: `Solving gives ${P.crit.length} critical point${P.crit.length > 1 ? 's' : ''}: ${P.crit.map((q) => `(${q.join(', ')})`).join(', ')}.` },
  ];
  P.crit.forEach(([x, y]) => {
    const o = classify(P, [x, y]);
    list.push({ text: `At (${x}, ${y}): the second partials and D.`, tex: `f_{xx}=${o.fxx},\\ f_{yy}=${o.fyy},\\ f_{xy}=${o.fxy},\\quad D=${o.fxx}\\cdot${o.fyy}-(${o.fxy})^2=${o.D}` });
    list.push({ text: `Verdict at (${x}, ${y}): ${o.verdict}.${o.D === 0 ? ' Look at the graph or the values near the point to decide.' : ''}` });
  });
  return list;
}
const formula = liveFormula(document.querySelector('#formula'), () => 'D=f_{xx}f_{yy}-f_{xy}^{2}');
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose f' },
    { key: 'fn', label: 'f(x, y)', options: Object.entries(PRESETS).map(([k, v]) => [k, v.name]) },
    { readout: [['Critical points', (s) => PRESETS[s.fn].crit.map((q) => `(${q.join(', ')})`).join('  ')], ['Verdicts', (s) => PRESETS[s.fn].crit.map((q) => classify(PRESETS[s.fn], q).verdict.split(':')[0]).join(', ')]] },
  ],
  onChange: () => formula.update(state),
});
