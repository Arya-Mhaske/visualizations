import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { coll, ke } from './_collisions.js';

const state = { e: 0.5, m1: 2, u1: 6, m2: 3, u2: 0 };
const after = (s) => coll(s.m1, s.u1, s.m2, s.u2, s.e);

barTool({
  state,
  label: 'Bars for the two velocities after a collision and the fraction of kinetic energy lost, for an adjustable coefficient of restitution.',
  rows: (s, c) => {
    const [v1, v2] = after(s);
    const k0 = ke(s.m1, s.u1, s.m2, s.u2);
    return [['v₁ after', Math.abs(v1), c.fillA, fixed(v1, 2)], ['v₂ after', Math.abs(v2), c.fillB, fixed(v2, 2)], ['KE lost', k0 - ke(s.m1, v1, s.m2, v2), c.fillC, `${fixed(((k0 - ke(s.m1, v1, s.m2, v2)) / k0) * 100 || 0, 0)}%`]];
  },
  max: 25,
  controls: [
    { title: 'Collision lab' },
    { key: 'e', label: 'Restitution e', min: 0, max: 1, step: 0.05 },
    { key: 'm1', label: 'Mass 1 (kg)', min: 1, max: 5, step: 1 },
    { key: 'u1', label: 'Velocity 1 (m/s)', min: 0, max: 8, step: 1 },
    { key: 'm2', label: 'Mass 2 (kg)', min: 1, max: 5, step: 1 },
    { key: 'u2', label: 'Velocity 2 (m/s)', min: -4, max: 4, step: 1 },
    { readout: [
      ['Separation ÷ approach', (s) => fixed((after(s)[1] - after(s)[0]) / (s.u1 - s.u2 || 1), 2)],
      ['Momentum after', (s) => fixed(s.m1 * after(s)[0] + s.m2 * after(s)[1], 2)],
    ] },
  ],
  tex: (s) => `e=\\dfrac{v_2-v_1}{u_1-u_2}=${s.e}`,
});
