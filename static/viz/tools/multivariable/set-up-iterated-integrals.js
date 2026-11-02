import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// Sketch the region. For dy dx: fix x, and y runs from the bottom boundary to the top. For dx dy: fix y, and x runs from left to right.
export const REGIONS = {
  tri: { name: 'Triangle: 0 ≤ y ≤ x ≤ 2', xr: [0, 2], ylo: () => 0, yhi: (x) => x, yr: [0, 2], xlo: (y) => y, xhi: () => 2,
    tex1: '\\int_0^2\\!\\!\\int_0^{x}', tex2: '\\int_0^2\\!\\!\\int_{y}^{2}', say1: 'x runs from 0 to 2; for each x, y runs from 0 up to the line y = x.', say2: 'y runs from 0 to 2; for each y, x runs from the line x = y across to 2.' },
  curves: { name: 'Between y = x² and y = 2x', xr: [0, 2], ylo: (x) => x * x, yhi: (x) => 2 * x, yr: [0, 4], xlo: (y) => y / 2, xhi: (y) => Math.sqrt(y),
    tex1: '\\int_0^2\\!\\!\\int_{x^2}^{2x}', tex2: '\\int_0^4\\!\\!\\int_{y/2}^{\\sqrt y}', say1: 'The curves meet at x = 0 and x = 2. For each x, y runs from the parabola up to the line.', say2: 'y runs from 0 to 4. For each y, x runs from the line (x = y/2) to the parabola (x = √y).' },
  disk: { name: 'Quarter disk: x² + y² ≤ 4, x, y ≥ 0', xr: [0, 2], ylo: () => 0, yhi: (x) => Math.sqrt(4 - x * x), yr: [0, 2], xlo: () => 0, xhi: (y) => Math.sqrt(4 - y * y),
    tex1: '\\int_0^2\\!\\!\\int_0^{\\sqrt{4-x^2}}', tex2: '\\int_0^2\\!\\!\\int_0^{\\sqrt{4-y^2}}', say1: 'x runs from 0 to 2; for each x, y runs from 0 to the circle, y = √(4 − x²).', say2: 'y runs from 0 to 2; for each y, x runs from 0 to the circle, x = √(4 − y²).' },
};
const FUNCS = { one: { name: '1 (area)', f: () => 1, tex: '1' }, xy: { name: 'x y', f: (x, y) => x * y, tex: 'xy' }, sum: { name: 'x + y', f: (x, y) => x + y, tex: 'x+y' } };
const state = { region: 'tri', fn: 'one' };
const simpson = (g, a, b, n = 400) => { const h = (b - a) / n; let s = g(a) + g(b); for (let i = 1; i < n; i++) s += g(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };
export function both(s) {
  const R = REGIONS[s.region];
  const f = FUNCS[s.fn].f;
  const i1 = simpson((x) => simpson((y) => f(x, y), R.ylo(x), R.yhi(x), 200), R.xr[0], R.xr[1], 200);
  const i2 = simpson((y) => simpson((x) => f(x, y), R.xlo(y), R.xhi(y), 200), R.yr[0], R.yr[1], 200);
  return { i1, i2 };
}
const r = (v) => Number(v.toFixed(4));

function steps(s) {
  const R = REGIONS[s.region];
  const o = both(s);
  const F = FUNCS[s.fn].tex;
  return [
    { text: `Sketch the region: ${R.name}. Mark where its boundary curves cross.` },
    { text: `Order dy dx. ${R.say1}`, tex: `${R.tex1}${F}\\,dy\\,dx` },
    { text: `Order dx dy. ${R.say2}`, tex: `${R.tex2}${F}\\,dx\\,dy` },
    { text: 'Evaluate each (here numerically). The outer limits are always plain numbers.', tex: `${r(o.i1)}\\quad\\text{and}\\quad ${r(o.i2)}` },
    { text: Math.abs(o.i1 - o.i2) < 1e-3 ? 'Both orders agree.' : 'They differ: check the limits.' },
  ];
}
const formula = liveFormula(document.querySelector('#formula'), (s) => `\\iint_D ${FUNCS[s.fn].tex}\\,dA=${r(both(s).i1)}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Region and integrand' },
    { key: 'region', label: 'Region D', options: Object.entries(REGIONS).map(([k, v]) => [k, v.name]) },
    { key: 'fn', label: 'Integrand', options: Object.entries(FUNCS).map(([k, v]) => [k, v.name]) },
    { readout: [['dy dx', (s) => both(s).i1.toFixed(4)], ['dx dy', (s) => both(s).i2.toFixed(4)]] },
  ],
  onChange: (s) => formula.update(s),
});
