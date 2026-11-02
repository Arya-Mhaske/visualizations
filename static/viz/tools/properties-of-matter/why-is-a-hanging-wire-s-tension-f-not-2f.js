import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { M: 5, lam: 0.5, cut: 0.4 };
const L = 10;
const T = (s, x) => (s.M + s.lam * (L - x)) * G;

plotTool({
  state,
  label: 'The tension in a hanging wire against distance below the support. For a light wire it is the weight of the load at every point; for a heavy wire it is largest at the top. A dashed line shows the wrong value of twice the weight.',
  x: [0, L],
  y: [0, 150],
  xLabel: 'distance below the top (m)',
  yLabel: 'tension (N)',
  range: (s) => [[0, L], [0, Math.max(120, T(s, 0) * 1.1)]],
  curves: (s, c) => [[(x) => T(s, x), { color: c.b }], [() => 2 * s.M * G, { color: c.a, dash: [6, 5] }]],
  points: (s, c) => [[s.cut * L, T(s, s.cut * L), c.c, 8]],
  controls: [
    { title: 'Cut the wire' },
    { key: 'M', label: 'Hanging mass (kg)', min: 1, max: 10, step: 1 },
    { key: 'lam', label: 'Wire mass per metre (kg/m)', min: 0, max: 1, step: 0.1 },
    { key: 'cut', label: 'Cut at (fraction of the length)', min: 0, max: 1, step: 0.05 },
    { readout: [
      ['Weight of the load', (s) => `${fixed(s.M * G, 1)} N`],
      ['Tension at the cut', (s) => `${fixed(T(s, s.cut * L), 1)} N`],
      ['2F would be', (s) => `${fixed(2 * s.M * G, 1)} N (wrong)`],
    ] },
  ],
  tex: (s) => `T=Mg+\\lambda g\\,(L-x)=${fixed(T(s, s.cut * L), 1)}\\ \\mathrm{N}`,
});
