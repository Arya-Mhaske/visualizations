import { barTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { h: 0.5, A: 20 };
const V = (s, k) => (s.A * 1e-4) * s.h * [1, 2, 0.5][k];

barTool({
  state,
  label: 'Bars for the pressure at the base, the force on the base, and the weight of water in three vessels of the same base area and depth: a straight one, a wide-topped one and a narrow-topped one. Pressure and force on the base are equal; the weights are not.',
  rows: (s, c) => [
    ['pressure at base (all)', 1000 * G * s.h, c.fillB, `${sig(1000 * G * s.h, 3)} Pa`],
    ['force on base (all)', 1000 * G * s.h * s.A * 1e-4, c.fillC, `${sig(1000 * G * s.h * s.A * 1e-4, 3)} N`],
    ['weight: straight', 1000 * G * V(s, 0), c.fillA, `${sig(1000 * G * V(s, 0), 3)} N`],
    ['weight: wide top', 1000 * G * V(s, 1), c.fillA, `${sig(1000 * G * V(s, 1), 3)} N`],
    ['weight: narrow top', 1000 * G * V(s, 2), c.fillA, `${sig(1000 * G * V(s, 2), 3)} N`],
  ],
  max: (s) => 1000 * G * V(s, 1),
  left: 0.36,
  controls: [
    { title: 'Three vessels' },
    { key: 'h', label: 'Depth h (m)', min: 0.1, max: 2, step: 0.1 },
    { key: 'A', label: 'Base area (cm²)', min: 5, max: 50, step: 5 },
    { readout: [['P − Pa = ρgh', (s) => `${sig(1000 * G * s.h, 3)} Pa`]] },
  ],
  tex: (s) => `P=P_a+\\rho gh`,
});
