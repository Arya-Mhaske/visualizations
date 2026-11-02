import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { tuck: 1, t: 1.6, w0: 2 };
const I = (s) => 15 * (1 - 0.75 * s.tuck);
const w = (s) => (15 * s.w0) / I(s);
const turns = (s) => (w(s) * s.t) / (2 * Math.PI);

barTool({
  state,
  label: 'Bars for the diver moment of inertia, the angular speed and the number of somersaults in the flight. A tuck makes the moment of inertia small, so the spin is fast.',
  rows: (s, c) => [['I', I(s), c.fillB, `${fixed(I(s), 2)} kg m²`], ['ω', w(s), c.fillA, `${fixed(w(s), 2)} rad/s`], ['somersaults', turns(s), c.fillC, fixed(turns(s), 2)]],
  max: 10,
  left: 0.3,
  controls: [
    { title: 'In the air' },
    { key: 'tuck', label: 'Tuck (0 = open, 1 = full tuck)', min: 0, max: 1, step: 0.05 },
    { key: 't', label: 'Time in the air (s)', min: 0.8, max: 2.5, step: 0.1 },
    { key: 'w0', label: 'Spin when open (rad/s)', min: 0.5, max: 4, step: 0.5 },
    { readout: [['L = Iω', (s) => `${fixed(I(s) * w(s), 2)} (unchanged)`]] },
  ],
  tex: (s) => `I_1\\omega_1=I_2\\omega_2:\\ \\omega=${fixed(w(s), 2)}\\ \\mathrm{rad/s}`,
});
