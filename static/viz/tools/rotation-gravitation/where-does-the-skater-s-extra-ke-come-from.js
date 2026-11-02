import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { r1: 0.4 };
const [I0, m, L0, R0] = [1.5, 2, 6, 1];
const I = (r) => I0 + 2 * m * r * r;
const w = (r) => L0 / I(r);
const F = (r) => 2 * m * w(r) ** 2 * r; // total pull on both weights
const K = (r) => 0.5 * I(r) * w(r) ** 2;
function work(a, b) {
  const n = 400;
  const h = (a - b) / n;
  let t = 0;
  for (let i = 0; i < n; i++) t += F(b + (i + 0.5) * h) * h;
  return t;
}

plotTool({
  state,
  label: 'The inward pull needed on the weights against their distance from the axis, with the area under the curve between the final and starting distance shaded. That area is the work done by the arms.',
  x: [0, 1],
  y: [0, 60],
  xLabel: 'distance r (m)',
  yLabel: 'pull on the weights (N)',
  range: () => [[0, 1.05], [0, 40]],
  shades: (s, c) => [[F, null, s.r1, R0, c.fillA]],
  curves: (s, c) => [[F, { color: c.ink }]],
  points: (s, c) => [[s.r1, F(s.r1), c.a], [R0, F(R0), c.b]],
  controls: [
    { title: 'Pull the arms in' },
    { key: 'r1', label: 'Final arm length (m)', min: 0.2, max: 0.95, step: 0.05 },
    { readout: [
      ['Work done by the arms', (s) => `${fixed(work(R0, s.r1), 3)} J`],
      ['KE gain', (s) => `${fixed(K(s.r1) - K(R0), 3)} J`],
      ['Match?', (s) => ({ text: Math.abs(work(R0, s.r1) - (K(s.r1) - K(R0))) < 1e-3 ? 'yes' : 'no', good: true })],
    ] },
  ],
  tex: (s) => `W=\\int F\\,dr=${fixed(work(R0, s.r1), 3)}\\ \\mathrm{J}=\\Delta K`,
});
