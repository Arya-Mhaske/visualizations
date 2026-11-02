import { createTool } from '../../lib/tool.js';
import { bars, G } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { h: 5, mu: 0.3, extra: 8 };
const direct = (s) => Math.hypot(12, s.h);
const fr = (s, L) => -s.mu * G * L;
const grav = (s) => -G * s.h;

createTool({
  state,
  label: 'Bars of the work done per kilogram by gravity and by friction along two routes from A to B and around a closed loop. Gravity gives the same work for both routes and zero round the loop. Friction depends on the route and never gives zero round the loop.',
  draw(ctx, stage, c) {
    const L1 = direct(state);
    const L2 = L1 + state.extra;
    const rows = [
      ['gravity, route 1', Math.abs(grav(state)), c.fillB, `${fixed(grav(state), 1)} J/kg`],
      ['gravity, route 2', Math.abs(grav(state)), c.fillB, `${fixed(grav(state), 1)} J/kg`],
      ['gravity, loop', 0.001, c.fillC, '0'],
      ['friction, route 1', Math.abs(fr(state, L1)), c.fillA, `${fixed(fr(state, L1), 1)} J/kg`],
      ['friction, route 2', Math.abs(fr(state, L2)), c.fillA, `${fixed(fr(state, L2), 1)} J/kg`],
      ['friction, loop', Math.abs(fr(state, L1 + L2)), c.fillA, `${fixed(fr(state, L1 + L2), 1)} J/kg`],
    ];
    bars(ctx, stage, c, rows, { max: Math.max(80, ...rows.map((r) => r[1])), left: 0.34 });
  },
  controls: [
    { title: 'Two routes from A to B' },
    { key: 'h', label: 'Height of B above A (m)', min: 1, max: 10, step: 1 },
    { key: 'mu', label: 'Friction μ', min: 0, max: 0.6, step: 0.05 },
    { key: 'extra', label: 'Route 2 is longer by (m)', min: 0, max: 20, step: 1 },
    { readout: [
      ['Route 1 length', (s) => `${fixed(direct(s), 1)} m`],
      ['Route 2 length', (s) => `${fixed(direct(s) + s.extra, 1)} m`],
      ['Gravity, round the loop', () => '0'],
    ] },
  ],
  tex: (s) => `\\oint \\vec F_g\\cdot d\\vec r=0\\qquad \\oint \\vec f\\cdot d\\vec r=${fixed(fr(s, 2 * direct(s) + s.extra), 1)}\\ne0`,
});
