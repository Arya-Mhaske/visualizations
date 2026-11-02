import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { F: 10, r: 0.5, w: 6 };

barTool({
  state,
  label: 'Bars for the force on a particle, its torque, its speed and the power computed in two ways, which match.',
  rows: (s, c) => [
    ['torque τ = Fr', s.F * s.r, c.fillA, `${fixed(s.F * s.r, 2)} N m`],
    ['speed v = ωr', s.w * s.r, c.fillB, `${fixed(s.w * s.r, 2)} m/s`],
    ['power F·v', s.F * s.w * s.r, c.fillC, `${fixed(s.F * s.w * s.r, 2)} W`],
    ['power τ·ω', s.F * s.r * s.w, c.fillC, `${fixed(s.F * s.r * s.w, 2)} W`],
  ],
  max: 60,
  controls: [
    { title: 'A particle on a rotating body' },
    { key: 'F', label: 'Tangential force F (N)', min: 1, max: 20, step: 1 },
    { key: 'r', label: 'Radius r (m)', min: 0.1, max: 2, step: 0.1 },
    { key: 'w', label: 'Angular speed ω (rad/s)', min: 1, max: 20, step: 1 },
    { readout: [['Work in dθ = 1 rad', (s) => `${fixed(s.F * s.r, 2)} J`]] },
  ],
  tex: (s) => `P=Fv=F(\\omega r)=(Fr)\\omega=\\tau\\omega=${fixed(s.F * s.r * s.w, 2)}\\ \\mathrm{W}`,
});
