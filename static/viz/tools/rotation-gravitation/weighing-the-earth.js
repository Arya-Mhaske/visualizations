import { barTool } from '../../lib/recipes.js';
import { sci } from '../../lib/format.js';
import { GN } from './_rg.js';

const state = { g: 9.8, R: 6371, r: 384400, T: 27.3 };
const m1 = (s) => (s.g * (s.R * 1e3) ** 2) / GN;
const m2 = (s) => (4 * Math.PI ** 2 * (s.r * 1e3) ** 3) / (GN * (s.T * 86400) ** 2);

barTool({
  state,
  label: 'Two bars for the mass of the Earth found from the surface gravity and from the Moon\'s orbit, with the accepted value for comparison.',
  rows: (s, c) => [['from g and R', m1(s), c.fillA, `${sci(m1(s), 3)} kg`], ['from the Moon', m2(s), c.fillB, `${sci(m2(s), 3)} kg`], ['accepted', 5.972e24, c.fillC, '5.972 × 10²⁴ kg']],
  max: 8e24,
  left: 0.3,
  controls: [
    { title: 'Two routes' },
    { key: 'g', label: 'g (m/s²)', min: 9.7, max: 9.9, step: 0.01 },
    { key: 'R', label: 'Earth radius (km)', min: 6300, max: 6450, step: 10 },
    { key: 'r', label: 'Moon distance (km)', min: 380000, max: 390000, step: 500 },
    { key: 'T', label: 'Moon period (days)', min: 26.5, max: 28, step: 0.1 },
    { readout: [['M from g R² / G', (s) => `${sci(m1(s), 3)} kg`], ['M from 4π²r³ / G T²', (s) => `${sci(m2(s), 3)} kg`]] },
  ],
  tex: (s) => `M=\\dfrac{gR^2}{G}=${sci(m1(s), 3)}\\ \\mathrm{kg}`,
});
