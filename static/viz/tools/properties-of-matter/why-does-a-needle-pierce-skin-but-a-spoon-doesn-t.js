import { barTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { F: 2 };
const AREAS = [['needle tip (0.01 mm²)', 1e-8], ['spoon (1 cm²)', 1e-4]];
const LIM = 1e6;

barTool({
  state,
  label: 'Bars, on a log scale, of the pressure from a needle and from a spoon under the same force, with the pressure at which skin tears. Only the needle passes the line.',
  rows: (s, c) => [...AREAS.map(([n, a], i) => [n.split(' ')[0], Math.log10((s.F / a) / 1e3), s.F / a > LIM ? c.fillA : c.fillC, `${sig(s.F / a, 3)} Pa`]), ['skin tears at', Math.log10(LIM / 1e3), c.fillB, '~10⁶ Pa (illustrative)']],
  max: 6,
  left: 0.3,
  controls: [
    { title: 'Push' },
    { key: 'F', label: 'Force (N)', min: 0.1, max: 100, step: 0.1 },
    { readout: [['Needle', (s) => (s.F / 1e-8 > LIM ? 'pierces' : 'does not pierce')], ['Spoon', (s) => (s.F / 1e-4 > LIM ? 'pierces' : 'does not pierce')], ['Pressure ratio', () => '10⁴']] },
  ],
  tex: (s) => `p=\\dfrac FA`,
});
