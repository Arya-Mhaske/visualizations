import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fx, fy } from './_mv.js';

// D_u f = ∇f · u, where u is a UNIT vector. Give any direction vector v, then divide by its length first.
export const FUNCS = {
  a: { name: 'x² y', f: (x, y) => x * x * y, tex: 'x^2y' },
  b: { name: 'x² + 3y²', f: (x, y) => x * x + 3 * y * y, tex: 'x^2+3y^2' },
  c: { name: 'x e^y', f: (x, y) => x * Math.exp(y), tex: 'xe^{y}' },
  d: { name: 'sin x cos y', f: (x, y) => Math.sin(x) * Math.cos(y), tex: '\\sin x\\cos y' },
};
const state = { fn: 'a', x: 2, y: 1, vx: 3, vy: 4 };
export function compute(s) {
  const f = FUNCS[s.fn].f;
  const g = [fx(f, s.x, s.y), fy(f, s.x, s.y)];
  const len = Math.hypot(s.vx, s.vy) || 1;
  const u = [s.vx / len, s.vy / len];
  return { g, len, u, D: g[0] * u[0] + g[1] * u[1], max: Math.hypot(...g) };
}
const r = (v) => Number(v.toFixed(4));

function steps(s) {
  const o = compute(s);
  return [
    { text: 'Find the gradient at the point.', tex: `\\nabla f(${s.x},${s.y})=(${r(o.g[0])},\\,${r(o.g[1])})` },
    { text: 'Turn the direction vector into a unit vector by dividing by its length.', tex: `|\\mathbf v|=${r(o.len)},\\quad \\mathbf u=(${r(o.u[0])},\\,${r(o.u[1])})` },
    { text: 'Take the dot product.', tex: `D_{\\mathbf u}f=${r(o.g[0])}(${r(o.u[0])})+${r(o.g[1])}(${r(o.u[1])})=${r(o.D)}` },
    { text: `The largest possible slope is |∇f| = ${r(o.max)}, reached by walking along ∇f. Your direction gives ${r(o.D / (o.max || 1))} of that.`, tex: `\\cos\\theta=\\dfrac{D_{\\mathbf u}f}{|\\nabla f|}=${r(o.D / (o.max || 1))}` },
  ];
}
const formula = liveFormula(document.querySelector('#formula'), (s) => `D_{\\mathbf u}f=\\nabla f\\cdot\\mathbf u=${r(compute(s).D)}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Slope in a chosen direction' },
    { key: 'fn', label: 'f(x, y)', options: Object.entries(FUNCS).map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'Point x', min: -3, max: 3, step: 0.5 },
    { key: 'y', label: 'Point y', min: -3, max: 3, step: 0.5 },
    { key: 'vx', label: 'Direction vector, x part', min: -5, max: 5, step: 1 },
    { key: 'vy', label: 'Direction vector, y part', min: -5, max: 5, step: 1 },
    { readout: [['D_u f', (s) => compute(s).D.toFixed(4)], ['Steepest possible', (s) => compute(s).max.toFixed(4)]] },
  ],
  onChange: (s) => formula.update(s),
});
