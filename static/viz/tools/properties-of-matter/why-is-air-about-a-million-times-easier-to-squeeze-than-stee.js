import { barTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const B = [['steel', 160e9], ['water', 2.2e9], ['air', 1e5]];
const state = { p: 1 };

barTool({
  state,
  label: 'Bars, on a log scale, of the fractional volume change of steel, water and air under the same pressure. Air shrinks about a million times more than steel.',
  rows: (s, c) => B.map(([n, b], i) => [n, Math.log10((s.p * 101325) / b) + 9, [c.fillB, c.fillC, c.fillA][i], `ΔV/V = ${sig((s.p * 101325) / b, 3)}`]),
  max: 9,
  left: 0.2,
  controls: [
    { title: 'The same squeeze' },
    { key: 'p', label: 'Pressure (atm)', min: 0.1, max: 1000, step: 0.1 },
    { readout: [['B: steel | water | air', () => '160 | 2.2 | 0.0001 GPa'], ['Ratio steel : air', () => '1.6 × 10⁶']] },
  ],
  tex: (s) => `\\dfrac{\\Delta V}{V}=\\dfrac{p}{B}`,
});
