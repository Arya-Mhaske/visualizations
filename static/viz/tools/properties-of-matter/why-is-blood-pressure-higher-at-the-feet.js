import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { stand: true, P0: 100 };
const P = (s, y) => s.P0 + (s.stand ? (1060 * G * y * 1) / 133.3 : 0); // y metres below the heart, in mmHg

plotTool({
  state,
  label: 'Blood pressure against position from the head to the feet. When standing, the pressure rises steadily with depth below the heart; lying down, it is the same everywhere.',
  x: [-0.5, 1.3],
  y: [0, 220],
  xLabel: 'distance below the heart (m): head −0.5, feet +1.3',
  yLabel: 'P (mm Hg)',
  range: () => [[-0.5, 1.4], [0, 230]],
  curves: (s, c) => [[(y) => P(s, y), { color: c.a }]],
  points: (s, c) => [[-0.5, P(s, -0.5), c.b], [0, P(s, 0), c.c], [1.3, P(s, 1.3), c.a]],
  texts: () => [['head', -0.4, 20, {}], ['heart', 0.05, 20, {}], ['feet', 1.25, 20, {}]],
  controls: [
    { title: 'Posture' },
    { key: 'stand', label: 'Standing upright', toggle: true },
    { key: 'P0', label: 'Pressure at the heart (mm Hg)', min: 80, max: 140, step: 5 },
    { readout: [
      ['At the head', (s) => `${fixed(P(s, -0.5), 0)} mm Hg`],
      ['At the heart', (s) => `${fixed(P(s, 0), 0)} mm Hg`],
      ['At the feet', (s) => `${fixed(P(s, 1.3), 0)} mm Hg`],
    ] },
  ],
  tex: () => `\\Delta P=\\rho gh=1060\\times9.8\\times1.3=13.5\\ \\mathrm{kPa}`,
});
