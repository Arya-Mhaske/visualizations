import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { R: 1.52 };
const T = (R) => R ** 1.5;

plotTool({
  state,
  label: 'The orbital period in years against the distance from the Sun in astronomical units, a rising curve, with a marker at the chosen distance.',
  x: [0, 10],
  y: [0, 32],
  xLabel: 'R (AU)',
  yLabel: 'T (years)',
  range: () => [[0, 10], [0, 32]],
  curves: (s, c) => [[T, { color: c.b }]],
  points: (s, c) => [[s.R, T(s.R), c.a]],
  controls: [
    { title: 'Distance from the Sun' },
    { key: 'R', label: 'R (AU)', min: 0.3, max: 10, step: 0.01 },
    { readout: [
      ['T = R^(3/2)', (s) => `${fixed(T(s.R), 3)} years`],
      ['In days', (s) => `${fixed(T(s.R) * 365.25, 0)} days`],
    ] },
  ],
  tex: (s) => `T=R^{3/2}=${s.R}^{1.5}=${fixed(T(s.R), 3)}\\ \\text{years}`,
});
