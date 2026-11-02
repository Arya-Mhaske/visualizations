import { barTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { P1: 150, v1: 2, ratio: 2, h2: 1 };
const v2 = (s) => s.v1 * s.ratio;
const P2 = (s) => s.P1 * 1000 + 0.5 * 1000 * (s.v1 ** 2 - v2(s) ** 2) - 1000 * G * s.h2;

barTool({
  state,
  label: 'Bars for the three terms of Bernoulli\'s equation, pressure, kinetic energy per volume and gravitational energy per volume, at the wide low point and at the narrow high point. The totals are equal.',
  rows: (s, c) => [
    ['point 1: P', s.P1 * 1000, c.fillA, `${sig(s.P1, 3)} kPa`], ['point 1: ½ρv²', 500 * s.v1 ** 2, c.fillB, `${sig(500 * s.v1 ** 2, 3)}`], ['point 1: ρgh', 0.001, c.fillC, '0'],
    ['point 2: P', Math.max(P2(s), 0), c.fillA, `${sig(P2(s) / 1000, 3)} kPa`], ['point 2: ½ρv²', 500 * v2(s) ** 2, c.fillB, `${sig(500 * v2(s) ** 2, 3)}`], ['point 2: ρgh', 1000 * G * s.h2, c.fillC, `${sig(1000 * G * s.h2, 3)}`],
  ],
  max: (s) => s.P1 * 1000,
  left: 0.3,
  controls: [
    { title: 'A pipe that narrows and rises' },
    { key: 'P1', label: 'Pressure at the wide end (kPa)', min: 110, max: 300, step: 5 },
    { key: 'v1', label: 'Speed at the wide end (m/s)', min: 0.5, max: 4, step: 0.5 },
    { key: 'ratio', label: 'Speed-up factor (A₁/A₂)', min: 1, max: 4, step: 0.5 },
    { key: 'h2', label: 'Height of the narrow end (m)', min: 0, max: 5, step: 0.5 },
    { readout: [['Total at 1 (Pa)', (s) => sig(s.P1 * 1000 + 500 * s.v1 ** 2, 5)], ['Total at 2 (Pa)', (s) => sig(P2(s) + 500 * v2(s) ** 2 + 1000 * G * s.h2, 5)], ['P₂', (s) => `${sig(P2(s) / 1000, 4)} kPa`]] },
  ],
  tex: (s) => `P+\\tfrac12\\rho v^2+\\rho gh=\\text{constant}`,
});
