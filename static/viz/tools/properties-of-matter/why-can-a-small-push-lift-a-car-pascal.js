import { barTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { F1: 200, A1: 5, A2: 500, x2: 1 };
const F2 = (s) => (s.F1 * s.A2) / s.A1;
const x1 = (s) => (s.x2 * s.A2) / s.A1;

barTool({
  state,
  label: 'Bars for the force and distance on the small piston and the large piston, and the work done by each, which are equal.',
  rows: (s, c) => [['force: small', s.F1, c.fillA, `${s.F1} N`], ['force: large', F2(s), c.fillB, `${sig(F2(s), 3)} N`], ['distance: small', x1(s) / 100, c.fillA, `${sig(x1(s), 3)} cm`], ['distance: large', s.x2 / 100, c.fillB, `${s.x2} cm`], ['work in = out', s.F1 * x1(s) / 100, c.fillC, `${sig((s.F1 * x1(s)) / 100, 3)} J`]],
  max: (s) => Math.max(F2(s), 1),
  left: 0.32,
  controls: [
    { title: 'The hydraulic lift' },
    { key: 'F1', label: 'Push on the small piston (N)', min: 50, max: 500, step: 10 },
    { key: 'A1', label: 'Small piston area (cm²)', min: 1, max: 20, step: 1 },
    { key: 'A2', label: 'Large piston area (cm²)', min: 50, max: 2000, step: 50 },
    { key: 'x2', label: 'Lift the load by (cm)', min: 0.5, max: 5, step: 0.5 },
    { readout: [['Pressure', (s) => `${sig((s.F1 / (s.A1 * 1e-4)) / 1e3, 3)} kPa`], ['Force ratio', (s) => `×${sig(s.A2 / s.A1, 3)}`]] },
  ],
  tex: (s) => `\\dfrac{F_1}{A_1}=\\dfrac{F_2}{A_2}\\ \\Rightarrow\\ F_2=${sig(F2(s), 3)}\\ \\mathrm{N}`,
});
