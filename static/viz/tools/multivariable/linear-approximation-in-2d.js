import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fx, fy } from './_mv.js';

// L(x, y) = f(a, b) + f_x(a, b)(x − a) + f_y(a, b)(y − b): the tangent plane used as a calculator.
export const FUNCS = {
  root: { name: '√(x² + y²)', f: (x, y) => Math.sqrt(x * x + y * y), tex: '\\sqrt{x^2+y^2}', a: 3, b: 4 },
  prod: { name: 'x² y', f: (x, y) => x * x * y, tex: 'x^2y', a: 2, b: 3 },
  log: { name: 'ln(x² + y²)', f: (x, y) => Math.log(x * x + y * y), tex: '\\ln(x^2+y^2)', a: 1, b: 2 },
  exp: { name: 'x e^y', f: (x, y) => x * Math.exp(y), tex: 'xe^{y}', a: 2, b: 0 },
};
const state = { fn: 'root', a: 3, b: 4, dx: 0.02, dy: -0.03 };
export function approx(s) {
  const f = FUNCS[s.fn].f;
  const [A, B] = [s.a, s.b];
  const base = f(A, B);
  const [px, py] = [fx(f, A, B), fy(f, A, B)];
  const est = base + px * s.dx + py * s.dy;
  const exact = f(A + s.dx, B + s.dy);
  return { base, px, py, est, exact, err: est - exact };
}
const r = (v, k = 5) => Number(v.toFixed(k));

function steps(s) {
  const o = approx(s);
  const F = FUNCS[s.fn];
  return [
    { text: `Choose a base point (a, b) = (${s.a}, ${s.b}) where f is easy, and a nearby point (a + ${s.dx}, b + ${s.dy}).`, tex: `f(x,y)=${F.tex}` },
    { text: 'Find f at the base point.', tex: `f(${s.a},${s.b})=${r(o.base)}` },
    { text: 'Find both partial derivatives there.', tex: `f_x=${r(o.px)},\\quad f_y=${r(o.py)}` },
    { text: 'Write the tangent plane and put in the small steps.', tex: `L=${r(o.base)}+${r(o.px)}(${s.dx})+${r(o.py)}(${s.dy})` },
    { text: 'The estimate:', tex: `f(${r(s.a + s.dx, 3)},${r(s.b + s.dy, 3)})\\approx ${r(o.est)}` },
    { text: 'Compare with the true value from a calculator.', tex: `\\text{exact}=${r(o.exact)},\\quad \\text{error}=${r(o.err, 6)}` },
  ];
}
const formula = liveFormula(document.querySelector('#formula'), (s) => `\\Delta f\\approx f_x\\,\\Delta x+f_y\\,\\Delta y=${r(approx(s).est - approx(s).base)}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Estimate f near (a, b)' },
    { key: 'fn', label: 'Function', options: Object.entries(FUNCS).map(([k, v]) => [k, v.name]) },
    { key: 'a', label: 'Base x, a', min: -4, max: 4, step: 0.5 },
    { key: 'b', label: 'Base y, b', min: -4, max: 4, step: 0.5 },
    { key: 'dx', label: 'Step in x', min: -0.5, max: 0.5, step: 0.01, format: (v) => v.toFixed(2) },
    { key: 'dy', label: 'Step in y', min: -0.5, max: 0.5, step: 0.01, format: (v) => v.toFixed(2) },
    { readout: [['Estimate', (s) => approx(s).est.toFixed(5)], ['Exact', (s) => approx(s).exact.toFixed(5)], ['Error', (s) => approx(s).err.toExponential(2)]] },
  ],
  onChange: (s) => formula.update(s),
});
