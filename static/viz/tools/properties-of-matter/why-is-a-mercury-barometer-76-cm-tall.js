import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const LIQ = [['mercury', 13600], ['oil', 900], ['water', 1000]];
const state = { p: 1 };
const h = (s, rho) => (s.p * 101325) / (rho * G);

barTool({
  state,
  label: 'Bars for the height of the liquid column that the atmosphere supports in a barometer made with mercury, oil and water. Mercury needs the shortest column.',
  rows: (s, c) => LIQ.map(([n, rho], i) => [n, h(s, rho), [c.fillB, c.fillC, c.fillA][i], `${fixed(h(s, rho), 3)} m`]),
  max: 12,
  left: 0.22,
  controls: [
    { title: 'The atmosphere' },
    { key: 'p', label: 'Air pressure (atm)', min: 0.3, max: 1.2, step: 0.01 },
    { readout: [['Mercury column', (s) => `${fixed(h(s, 13600) * 100, 1)} cm`], ['Water column', (s) => `${fixed(h(s, 1000), 2)} m`]] },
  ],
  tex: (s) => `h=\\dfrac{P}{\\rho g}=\\dfrac{${fixed(s.p * 101325, 0)}}{13600\\times9.8}=${fixed(h(s, 13600), 3)}\\ \\mathrm{m}`,
});
