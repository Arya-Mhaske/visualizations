import { createTool } from '../../lib/tool.js';
import { bars } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { m: 1, h: 1000, v: 50 };
const g = 10;
const Wg = (s) => (s.m / 1000) * g * s.h;
const K = (s) => 0.5 * (s.m / 1000) * s.v ** 2;

createTool({
  state,
  label: 'Three bars: the work done by gravity, the kinetic energy at the bottom, and the work done by air, which is negative and makes up the difference.',
  draw(ctx, stage, c) {
    bars(ctx, stage, c, [['gravity', Wg(state), c.fillC, `+${fixed(Wg(state), 2)} J`], ['air', Math.abs(K(state) - Wg(state)), c.fillA, `${fixed(K(state) - Wg(state), 2)} J`], ['kinetic energy', K(state), c.fillB, `${fixed(K(state), 2)} J`]], { max: 20 });
  },
  controls: [
    { title: 'The raindrop' },
    { key: 'm', label: 'Mass (g)', min: 0.5, max: 2, step: 0.1 },
    { key: 'h', label: 'Height fallen (m)', min: 200, max: 2000, step: 100 },
    { key: 'v', label: 'Speed at the bottom (m/s)', min: 0, max: 100, step: 5 },
    { readout: [
      ['Work by gravity', (s) => `${fixed(Wg(s), 2)} J`],
      ['Final KE', (s) => `${fixed(K(s), 2)} J`],
      ['Work by air', (s) => `${fixed(K(s) - Wg(s), 2)} J`],
    ] },
  ],
  tex: (s) => `W_g+W_{\\text{air}}=\\Delta K\\ \\Rightarrow\\ W_{\\text{air}}=${fixed(K(s) - Wg(s), 2)}\\ \\mathrm{J}`,
});
