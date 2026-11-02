import { plotTool } from '../../lib/recipes.js';
import { sci, fixed } from '../../lib/format.js';
import { GN } from './_rg.js';

const [m, M, d, l, kappa] = [0.0158, 1.5, 0.045, 0.1, 1.5e-9];
const state = { th: 0.104 };
const theory = () => (2 * GN * M * m * l) / (d * d) / kappa;
const Gmeas = (s) => (kappa * s.th * d * d) / (2 * l * M * m);

plotTool({
  state,
  label: 'The twisting torque on the wire against the twist angle: a straight line whose slope is the wire stiffness. A marker shows the measured twist and the torque needed to produce it.',
  x: [0, 0.25],
  y: [0, 4e-10],
  xLabel: 'twist θ (rad)',
  yLabel: 'torque (N m)',
  range: () => [[0, 0.25], [0, 4e-10]],
  curves: (s, c) => [[(t) => kappa * t, { color: c.b }]],
  segments: (s, c) => [[theory(), 0, theory(), kappa * theory(), { color: c.c, dash: [5, 4], width: 2 }]],
  points: (s, c) => [[s.th, kappa * s.th, c.a]],
  controls: [
    { title: 'Read the twist' },
    { key: 'th', label: 'Measured twist θ (rad)', min: 0.02, max: 0.25, step: 0.002 },
    { readout: [
      ['G from this twist', (s) => `${sci(Gmeas(s), 3)} N m²/kg²`],
      ['Accepted G', () => '6.674 × 10⁻¹¹'],
      ['Twist expected for G', () => `${fixed(theory(), 3)} rad`],
    ] },
  ],
  tex: (s) => `G=\\dfrac{\\kappa\\theta d^2}{2lMm}=${sci(Gmeas(s), 3)}`,
});
