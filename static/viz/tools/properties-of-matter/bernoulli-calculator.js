import { barTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { P1: 200, v1: 1, h1: 0, v2: 4, h2: 2 };
const P2 = (s) => s.P1 * 1000 + 500 * (s.v1 ** 2 - s.v2 ** 2) + 1000 * G * (s.h1 - s.h2);

barTool({
  state,
  label: 'Bars for the pressure at two points on a streamline: the starting pressure and the pressure after the change in speed and height.',
  rows: (s, c) => [['P₁', s.P1 * 1000, c.fillA, `${sig(s.P1, 4)} kPa`], ['change from speed', Math.abs(500 * (s.v1 ** 2 - s.v2 ** 2)), c.fillB, `${sig(500 * (s.v1 ** 2 - s.v2 ** 2) / 1000, 3)} kPa`], ['change from height', Math.abs(1000 * G * (s.h1 - s.h2)), c.fillB, `${sig(1000 * G * (s.h1 - s.h2) / 1000, 3)} kPa`], ['P₂', Math.max(P2(s), 0), c.fillC, `${sig(P2(s) / 1000, 4)} kPa`]],
  max: (s) => Math.max(s.P1 * 1000, 1),
  left: 0.34,
  controls: [
    { title: 'Two points on a streamline (water)' },
    { key: 'P1', label: 'P₁ (kPa)', min: 100, max: 400, step: 10 },
    { key: 'v1', label: 'v₁ (m/s)', min: 0, max: 6, step: 0.5 },
    { key: 'h1', label: 'h₁ (m)', min: 0, max: 5, step: 0.5 },
    { key: 'v2', label: 'v₂ (m/s)', min: 0, max: 10, step: 0.5 },
    { key: 'h2', label: 'h₂ (m)', min: 0, max: 5, step: 0.5 },
    { readout: [['P₂', (s) => `${sig(P2(s) / 1000, 4)} kPa`]] },
  ],
  tex: (s) => `P_2=P_1+\\tfrac12\\rho(v_1^2-v_2^2)+\\rho g(h_1-h_2)=${sig(P2(s) / 1000, 4)}\\ \\mathrm{kPa}`,
});
