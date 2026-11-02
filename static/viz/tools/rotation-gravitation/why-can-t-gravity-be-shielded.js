import { barTool } from '../../lib/recipes.js';
import { sci } from '../../lib/format.js';
import { GN } from './_rg.js';

const state = { M: 1000, d: 10 };
const F = (s) => (GN * s.M * 1) / (s.d * s.d);

barTool({
  state,
  label: 'Bars for the pull on a one-kilogram mass inside a shell from an outside body, with and without the shell, and the pull of the shell itself, which is zero. A metal shell shielding an electric field is shown for contrast.',
  rows: (s, c) => [['outside body, no shell', F(s), c.fillB, `${sci(F(s), 2)} N`], ['outside body, shell present', F(s), c.fillB, `${sci(F(s), 2)} N`], ['the shell itself', 1e-30, c.fillC, '0 N'], ['electric: with metal shell', 1e-30, c.fillA, '0 (shielded)']],
  max: (s) => F(s),
  left: 0.4,
  controls: [
    { title: 'A mass inside a shell' },
    { key: 'M', label: 'Outside body (kg)', min: 100, max: 10000, step: 100 },
    { key: 'd', label: 'Distance to the outside body (m)', min: 3, max: 30, step: 1 },
    { readout: [['Pull on the inner mass', (s) => `${sci(F(s), 2)} N, shell or no shell`]] },
  ],
  tex: (s) => `F=\\dfrac{GMm}{d^2}\\ \\text{(unchanged by the shell)}`,
});
