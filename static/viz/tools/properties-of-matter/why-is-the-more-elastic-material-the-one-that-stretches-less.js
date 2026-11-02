import { barTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { F: 100, L: 1, d: 1 };
const A = (s) => (Math.PI * (s.d / 1000) ** 2) / 4;
const ext = (s, Y) => (s.F * s.L) / (A(s) * Y);
const Y = { steel: 2e11, rubber: 5e7 };

barTool({
  state,
  label: 'Bars, on a log scale, of how far a steel wire and a rubber cord stretch under the same load. The rubber stretches thousands of times more.',
  rows: (s, c) => [['steel wire', Math.log10(ext(s, Y.steel) * 1000) + 5, c.fillB, `${sig(ext(s, Y.steel) * 1000, 3)} mm`], ['rubber cord', Math.log10(ext(s, Y.rubber) * 1000) + 5, c.fillA, `${sig(ext(s, Y.rubber) * 1000, 3)} mm`]],
  max: 12,
  left: 0.3,
  controls: [
    { title: 'The same load' },
    { key: 'F', label: 'Load F (N)', min: 10, max: 1000, step: 10 },
    { key: 'L', label: 'Length L (m)', min: 0.5, max: 3, step: 0.5 },
    { key: 'd', label: 'Diameter (mm)', min: 0.5, max: 3, step: 0.5 },
    { readout: [
      ['Stress F/A', (s) => `${sig(s.F / A(s) / 1e6, 3)} MPa`],
      ['Strain: steel | rubber', (s) => `${sig(s.F / A(s) / Y.steel, 2)} | ${sig(s.F / A(s) / Y.rubber, 2)}`],
      ['Y: steel | rubber', () => '2 × 10¹¹ | 5 × 10⁷ Pa'],
    ] },
  ],
  tex: (s) => `Y=\\dfrac{F/A}{\\Delta L/L}\\ \\Rightarrow\\ \\Delta L=\\dfrac{FL}{AY}`,
});
