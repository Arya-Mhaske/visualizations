import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { coll, ke } from './_collisions.js';

const E = { 1: 'Elastic', 0.5: 'Inelastic', 0: 'Sticky' };
const state = { kind: 1, m1: 2, u1: 5, m2: 3, u2: -1 };
const after = (s) => coll(s.m1, s.u1, s.m2, s.u2, s.kind);

barTool({
  state,
  label: 'Bars for the total momentum and the total kinetic energy before and after a collision of two carts. Momentum always matches; kinetic energy only matches in an elastic collision.',
  rows: (s, c) => {
    const [v1, v2] = after(s);
    return [
      ['p before', Math.abs(s.m1 * s.u1 + s.m2 * s.u2) || 0.001, c.fillB, fixed(s.m1 * s.u1 + s.m2 * s.u2, 2)],
      ['p after', Math.abs(s.m1 * v1 + s.m2 * v2) || 0.001, c.fillC, fixed(s.m1 * v1 + s.m2 * v2, 2)],
      ['KE before', ke(s.m1, s.u1, s.m2, s.u2), c.fillB, `${fixed(ke(s.m1, s.u1, s.m2, s.u2), 1)} J`],
      ['KE after', ke(s.m1, v1, s.m2, v2), c.fillA, `${fixed(ke(s.m1, v1, s.m2, v2), 1)} J`],
    ];
  },
  max: 40,
  controls: [
    { title: 'Two carts on a track' },
    { key: 'kind', label: 'Collision', options: Object.entries(E).map(([k, v]) => [Number(k), v]) },
    { key: 'm1', label: 'Mass 1 (kg)', min: 1, max: 5, step: 1 },
    { key: 'u1', label: 'Velocity 1 (m/s)', min: -6, max: 6, step: 1 },
    { key: 'm2', label: 'Mass 2 (kg)', min: 1, max: 5, step: 1 },
    { key: 'u2', label: 'Velocity 2 (m/s)', min: -6, max: 6, step: 1 },
    { readout: [
      ['Velocities after', (s) => after(s).map((v) => fixed(v, 2)).join(' and ')],
      ['KE lost', (s) => `${fixed(ke(s.m1, s.u1, s.m2, s.u2) - ke(s.m1, ...[after(s)[0]], s.m2, after(s)[1]), 2)} J`],
    ] },
  ],
  tex: (s) => `m_1u_1+m_2u_2=m_1v_1+m_2v_2=${fixed(s.m1 * s.u1 + s.m2 * s.u2, 2)}`,
});
