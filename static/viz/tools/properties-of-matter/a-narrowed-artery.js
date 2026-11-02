import { plotTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { f: 0.5, v1: 0.3 };
const v2 = (s, f = s.f) => s.v1 / (f * f);
const dP = (s, f = s.f) => 0.5 * 1060 * (v2(s, f) ** 2 - s.v1 ** 2) / 133.3;

plotTool({
  state,
  label: 'Blood speed at the narrowing and the pressure drop there, against the remaining fraction of the artery radius. Both rise steeply as the artery closes.',
  x: [0.2, 1],
  y: [0, 5],
  xLabel: 'remaining radius (fraction)',
  yLabel: 'speed at the narrowing (m/s)',
  range: (s) => [[0.2, 1], [0, v2(s, 0.2) * 1.05]],
  curves: (s, c) => [[(f) => v2(s, f), { color: c.b }]],
  points: (s, c) => [[s.f, v2(s), c.a]],
  controls: [
    { title: 'The narrowing' },
    { key: 'f', label: 'Remaining radius (fraction)', min: 0.2, max: 1, step: 0.05 },
    { key: 'v1', label: 'Normal blood speed (m/s)', min: 0.1, max: 0.6, step: 0.05 },
    { readout: [
      ['Speed at the narrowing', (s) => `${sig(v2(s), 3)} m/s`],
      ['Factor', (s) => `×${sig(1 / (s.f * s.f), 3)}`],
      ['Pressure drop', (s) => `${sig(dP(s), 3)} mm Hg`],
    ] },
  ],
  tex: (s) => `v_2=\\dfrac{v_1}{f^2}=${sig(v2(s), 3)}\\ \\mathrm{m/s}`,
});
