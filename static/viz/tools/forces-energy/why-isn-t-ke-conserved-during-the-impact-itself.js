import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { t: 0.25 };
const T = 0.5;
const U = (x) => 0.5 * Math.sin((Math.PI * x) / T) ** 2;

plotTool({
  state,
  label: 'Energy against time during an elastic impact. The kinetic energy dips as the spring-like contact is squashed, while the stored energy rises, and the two always add to the starting energy.',
  x: [0, 0.5],
  y: [0, 1],
  xLabel: 'time during impact (s)',
  yLabel: 'energy (share of start)',
  range: () => [[0, T], [0, 1.1]],
  curves: (s, c) => [[(x) => 1 - U(x), { color: c.a }], [U, { color: c.b }], [() => 1, { color: c.ink, dash: [6, 5] }]],
  points: (s, c) => [[s.t, 1 - U(s.t), c.a], [s.t, U(s.t), c.b]],
  controls: [
    { title: 'Slow motion' },
    { key: 't', label: 'Time since first touch (s)', min: 0, max: T, step: 0.01 },
    { readout: [
      ['Kinetic energy', (s) => `${fixed((1 - U(s.t)) * 100, 0)}% of start`],
      ['Stored in the squash', (s) => `${fixed(U(s.t) * 100, 0)}%`],
      ['Total', () => '100% (elastic)'],
    ] },
  ],
  tex: () => `K+U_{\\text{contact}}=\\text{constant}`,
});
