import { barTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { g: 200 };
const abs = (s) => (s.g + 101.325) * 1000;

barTool({
  state,
  label: 'Two stacked pressures: atmospheric pressure and the gauge pressure, which add to the absolute pressure.',
  rows: (s, c) => [['atmosphere', 101325, c.fillB, '101.3 kPa'], ['gauge', s.g * 1000, c.fillA, `${s.g} kPa`], ['absolute', abs(s), c.fillC, `${sig(abs(s) / 1000, 4)} kPa`]],
  max: 500000,
  left: 0.26,
  controls: [
    { title: 'A tyre' },
    { key: 'g', label: 'Gauge pressure (kPa)', min: 0, max: 400, step: 5 },
    { readout: [['Pa', (s) => sig(abs(s), 5)], ['atm', (s) => sig(abs(s) / 101325, 4)], ['bar', (s) => sig(abs(s) / 1e5, 4)], ['torr (mm Hg)', (s) => sig(abs(s) / 133.322, 4)]] },
  ],
  tex: (s) => `P_{abs}=P_{gauge}+P_{atm}=${s.g}+101.3=${sig(abs(s) / 1000, 4)}\\ \\mathrm{kPa}`,
});
