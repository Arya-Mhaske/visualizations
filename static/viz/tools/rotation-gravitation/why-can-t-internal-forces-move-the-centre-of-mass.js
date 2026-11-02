import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { m: 30, M: 90, u: 3, V: 1 };
const vt = (s) => s.V - (s.m * s.u) / (s.m + s.M);
const vc = (s) => vt(s) + s.u;

plotTool({
  state,
  label: 'Position against time for a child running on a trolley: the child moves ahead faster, the trolley slows, and the centre of mass moves at the original steady speed.',
  x: [0, 8],
  y: [0, 40],
  xLabel: 't (s)',
  yLabel: 'x (m)',
  range: (s) => [[0, 8], [0, Math.max(s.V + s.u, 3) * 8 * 1.05]],
  curves: (s, c) => [[(t) => vc(s) * t, { color: c.a }], [(t) => vt(s) * t, { color: c.b }], [(t) => s.V * t, { color: c.c, dash: [6, 5] }]],
  texts: (s) => [['child', 6.5, vc(s) * 6.5 + 1.5, {}], ['trolley', 6.5, vt(s) * 6.5 - 2, {}], ['centre of mass', 4, s.V * 4 - 2, {}]],
  controls: [
    { title: 'Child on a trolley' },
    { key: 'm', label: 'Child mass (kg)', min: 20, max: 60, step: 5 },
    { key: 'M', label: 'Trolley mass (kg)', min: 30, max: 300, step: 10 },
    { key: 'u', label: 'Child runs at (m/s, relative)', min: 0, max: 6, step: 0.5 },
    { key: 'V', label: 'Centre-of-mass speed V (m/s)', min: 0, max: 3, step: 0.5 },
    { readout: [
      ['Child speed', (s) => `${fixed(vc(s), 2)} m/s`],
      ['Trolley speed', (s) => `${fixed(vt(s), 2)} m/s`],
      ['Centre of mass', (s) => `${fixed((s.m * vc(s) + s.M * vt(s)) / (s.m + s.M), 2)} m/s (= V)`],
    ] },
  ],
  tex: (s) => `V=\\dfrac{mv_c+Mv_t}{m+M}=${s.V}\\ \\mathrm{m/s}`,
});
