import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { e: 0.05 };
const F = (e) => 12 * ((1 + e) ** -7 - (1 + e) ** -13);
const line = (e) => 72 * e;

plotTool({
  state,
  label: 'The restoring force between two atoms against the change in their separation, compared with a straight Hooke line. The two agree near zero and part company as the strain grows.',
  x: [-0.1, 0.3],
  y: [-8, 12],
  xLabel: 'strain of the bond',
  yLabel: 'restoring force (arb.)',
  range: () => [[-0.1, 0.3], [-9, 14]],
  curves: (s, c) => [[F, { color: c.b }], [line, { color: c.a, dash: [6, 5] }]],
  points: (s, c) => [[s.e, F(s.e), c.b], [s.e, line(s.e), c.a, 5]],
  controls: [
    { title: 'Stretch the bond' },
    { key: 'e', label: 'Strain', min: -0.1, max: 0.3, step: 0.01 },
    { readout: [
      ['True force', (s) => fixed(F(s.e), 3)],
      ['Hooke line k x', (s) => fixed(line(s.e), 3)],
      ['Difference', (s) => `${fixed(Math.abs(F(s.e) - line(s.e)) / Math.max(Math.abs(F(s.e)), 1e-9) * 100, 1)}%`],
    ] },
  ],
  tex: () => `F(x)\\approx F(0)+F'(0)x=-kx`,
});
