import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// On a closed rectangle the biggest and smallest values are at an interior critical point or somewhere on the boundary.
// Check the interior critical points, then each of the four edges as a one-variable problem, then compare everything.
export const PRESETS = {
  a: { name: 'x² − 2xy + 2y on [0, 3] × [0, 2]', tex: 'x^2-2xy+2y', f: (x, y) => x * x - 2 * x * y + 2 * y, box: [0, 3, 0, 2], crit: [[1, 1]] },
  b: { name: 'x² + y² − 2x − 4y on [0, 3] × [0, 3]', tex: 'x^2+y^2-2x-4y', f: (x, y) => x * x + y * y - 2 * x - 4 * y, box: [0, 3, 0, 3], crit: [[1, 2]] },
  c: { name: 'xy(2 − x − y) on [0, 2] × [0, 2]', tex: 'xy(2-x-y)', f: (x, y) => x * y * (2 - x - y), box: [0, 2, 0, 2], crit: [[0, 0], [2 / 3, 2 / 3]] },
};
const state = { fn: 'a' };
const rd = (v) => Number(v.toFixed(4));
function edgeExtremes(f, edge, [x0, x1, y0, y1]) {
  let lo = { v: Infinity };
  let hi = { v: -Infinity };
  for (let i = 0; i <= 3000; i++) {
    const t = i / 3000;
    const [x, y] = edge === 'bottom' ? [x0 + t * (x1 - x0), y0] : edge === 'top' ? [x0 + t * (x1 - x0), y1] : edge === 'left' ? [x0, y0 + t * (y1 - y0)] : [x1, y0 + t * (y1 - y0)];
    const v = f(x, y);
    if (v < lo.v) lo = { v, p: [x, y] };
    if (v > hi.v) hi = { v, p: [x, y] };
  }
  return { lo, hi };
}
export function analyse(key) {
  const P = PRESETS[key];
  const cand = P.crit.map((p) => ({ p, v: P.f(...p), where: 'interior' }));
  for (const edge of ['bottom', 'top', 'left', 'right']) {
    const e = edgeExtremes(P.f, edge, P.box);
    cand.push({ p: e.lo.p, v: e.lo.v, where: `${edge} edge` }, { p: e.hi.p, v: e.hi.v, where: `${edge} edge` });
  }
  const max = cand.reduce((a, b) => (b.v > a.v + 1e-9 ? b : a));
  const min = cand.reduce((a, b) => (b.v < a.v - 1e-9 ? b : a));
  return { cand, max, min };
}
const pt = (p) => `(${rd(p[0])}, ${rd(p[1])})`;

function steps(s) {
  const P = PRESETS[s.fn];
  const o = analyse(s.fn);
  const list = [
    { text: 'Find the critical points inside the rectangle (where ∇f = 0).', tex: P.crit.map((p) => `f${pt(p)}=${rd(P.f(...p))}`).join(',\\ ') },
    { text: 'Check each edge as a function of one variable: its largest and smallest value there (corners included).' },
  ];
  o.cand.filter((c) => c.where !== 'interior').forEach((c, i) => list.push({ text: `${c.where}, ${i % 2 === 0 ? 'smallest' : 'largest'} value:`, tex: `f${pt(c.p)}=${rd(c.v)}` }));
  list.push({ text: 'Compare every candidate. The largest is the absolute maximum, the smallest the absolute minimum.', tex: `\\max=${rd(o.max.v)}\\text{ at }${pt(o.max.p)},\\quad \\min=${rd(o.min.v)}\\text{ at }${pt(o.min.p)}` });
  return list;
}
const formula = liveFormula(document.querySelector('#formula'), (s) => PRESETS[s.fn].tex);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a problem' },
    { key: 'fn', label: 'Problem', options: Object.entries(PRESETS).map(([k, v]) => [k, v.name]) },
    { readout: [['Absolute maximum', (s) => `${rd(analyse(s.fn).max.v)} at ${pt(analyse(s.fn).max.p)}`], ['Absolute minimum', (s) => `${rd(analyse(s.fn).min.v)} at ${pt(analyse(s.fn).min.p)}`]] },
  ],
  onChange: (s) => formula.update(s),
});
