import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { det, matVec, nullBasis } from './_la-math.js';

// Columns add to 1: column j says where a thing in state j goes next. The distribution after n steps is P^n p0.
const MODELS = {
  weather: { name: 'Weather', states: ['Sunny', 'Cloudy', 'Rainy'], P: [[0.7, 0.3, 0.2], [0.2, 0.4, 0.3], [0.1, 0.3, 0.5]] },
  shops: { name: 'Two shops', states: ['Shop A', 'Shop B'], P: [[0.9, 0.2], [0.1, 0.8]] },
  sticky: { name: 'Sticky', states: ['One', 'Two', 'Three'], P: [[0.9, 0.05, 0.05], [0.05, 0.9, 0.05], [0.05, 0.05, 0.9]] },
};
const state = { m: 'weather', start: 0, n: 5 };
const model = (s) => MODELS[s.m];
const start = (s) => model(s).states.map((_, i) => (i === Math.min(s.start, model(s).states.length - 1) ? 1 : 0));
function after(s, n) { let p = start(s); for (let i = 0; i < n; i++) p = matVec(model(s).P, p); return p; }
function steady(P) {
  const M = P.map((r, i) => r.map((v, j) => v - (i === j ? 1 : 0)));
  const v = nullBasis(M)[0];
  const total = v.reduce((a, b) => a + b, 0);
  return v.map((x) => x / total);
}
// The other eigenvalues: their sum is trace − 1 and their product is det (the first eigenvalue is 1).
function others(P) {
  const n = P.length;
  const tr = P.reduce((a, r, i) => a + r[i], 0) - 1;
  if (n === 2) return [tr];
  const prod = det(P);
  const disc = tr * tr - 4 * prod;
  return disc >= 0 ? [(tr + Math.sqrt(disc)) / 2, (tr - Math.sqrt(disc)) / 2] : [Math.sqrt(prod)];
}
const COLORS = ['a', 'b', 'c'];

createTool({
  state,
  label: 'The share of a population in each state after n steps of a Markov chain, drawn as lines against n. The shares start from a single state and move towards a steady distribution shown by the dashed lines. The steady state is the eigenvector for eigenvalue 1, and the other eigenvalues are smaller than 1, so their effect fades away.',
  setup: (stage, c) => createPlot(stage, { x: [0, 30], y: [0, 1], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    const m = model(state);
    const st = steady(m.P);
    plot.axes({ xLabel: 'steps n', yLabel: 'share' });
    m.states.forEach((name, i) => {
      plot.segment(0, st[i], 30, st[i], { color: c[COLORS[i]], width: 2, dash: [6, 5] });
      for (let n = 0; n < 30; n++) plot.segment(n, after(state, n)[i], n + 1, after(state, n + 1)[i], { color: c[COLORS[i]], width: 3 });
      plot.point(state.n, after(state, state.n)[i], { fill: c.fillY, r: 7 });
      plot.text(name, 29.5, st[i] + 0.04, { size: 10, color: c[COLORS[i]], align: 'right', patch: false });
    });
    plot.segment(state.n, 0, state.n, 1, { color: c.grid, width: 2, dash: [4, 4] });
  },
  controls: [
    { title: 'Run the chain' },
    { key: 'n', label: 'Steps taken, n', min: 0, max: 30, step: 1, format: (n) => `${n}` },
    { key: 'm', label: 'Chain', options: Object.entries(MODELS).map(([key, v]) => [key, v.name]) },
    { key: 'start', label: 'Start entirely in state', min: 0, max: 2, step: 1, format: (n) => `#${n + 1}` },
    { readout: [
      ['Shares now', (s) => after(s, s.n).map((v) => fixed(v, 3)).join(', ')],
      ['Steady state', (s) => steady(model(s).P).map((v) => fixed(v, 3)).join(', ')],
      ['Other eigenvalues', (s) => others(model(s).P).map((v) => fixed(v, 3)).join(', ')],
      ['Largest other, to the n', (s) => fixed(Math.max(...others(model(s).P).map(Math.abs)) ** s.n, 4)],
    ] },
  ],
  tex: (s) => `\\mathbf p_{${s.n}}=P^{${s.n}}\\mathbf p_0\\ \\to\\ \\mathbf p_\\infty,\\quad P\\mathbf p_\\infty=\\mathbf p_\\infty\\ (\\lambda=1)`,
});
