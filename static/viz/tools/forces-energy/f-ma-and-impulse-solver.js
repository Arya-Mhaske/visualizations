import { createTool } from '../../lib/tool.js';
import { bars } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { m: 0.15, v1: 12, v2: -12, dt: 0.01 };
const J = (s) => s.m * (s.v2 - s.v1);

createTool({
  state,
  label: 'Bars for the momentum before the hit, the momentum after, and the impulse, which is their difference.',
  draw(ctx, stage, c) {
    bars(ctx, stage, c, [['p before', state.m * state.v1, c.fillB, `${fixed(state.m * state.v1, 2)}`], ['p after', Math.abs(state.m * state.v2), state.v2 < 0 ? c.fillA : c.fillB, `${fixed(state.m * state.v2, 2)}`], ['impulse', Math.abs(J(state)), c.c, `${fixed(J(state), 2)} N s`]], { max: Math.max(Math.abs(state.m * state.v1), Math.abs(state.m * state.v2), Math.abs(J(state))) });
  },
  controls: [
    { title: 'The hit' },
    { key: 'm', label: 'Mass (kg)', min: 0.05, max: 1, step: 0.05 },
    { key: 'v1', label: 'Velocity before (m/s)', min: 1, max: 30, step: 1 },
    { key: 'v2', label: 'Velocity after (m/s)', min: -30, max: 30, step: 1 },
    { key: 'dt', label: 'Contact time (s)', min: 0.001, max: 0.05, step: 0.001 },
    { readout: [
      ['Impulse J', (s) => `${fixed(J(s), 2)} N s`],
      ['Average force', (s) => `${fixed(J(s) / s.dt, 0)} N`],
      ['F = ma: a for that force', (s) => `${fixed(J(s) / s.dt / s.m, 0)} m/s²`],
    ] },
  ],
  tex: (s) => `J=m(v_2-v_1)=${s.m}\\times(${s.v2}-${s.v1})=${fixed(J(s), 2)}\\ \\mathrm{N\\,s}`,
});
