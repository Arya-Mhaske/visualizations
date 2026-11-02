import { createTool } from '../../lib/tool.js';
import { bars } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { m: 0.02, v: 80, M: 100 };
const recoil = (s) => (s.m * s.v) / s.M;

createTool({
  state,
  label: 'Two bars of equal length show the forward momentum of the shell and the backward momentum of the gun. Their speeds are very different.',
  draw(ctx, stage, c) {
    bars(ctx, stage, c, [['shell p', state.m * state.v, c.fillA, `${fixed(state.m * state.v, 2)} kg m/s →`], ['gun p', state.m * state.v, c.fillB, `← ${fixed(state.m * state.v, 2)}`], ['shell v', state.v / 100, c.a, `${state.v} m/s`], ['gun v', recoil(state) / 100, c.b, `${fixed(recoil(state) * 100, 2)} cm/s`]], { max: Math.max(state.m * state.v, state.v / 100), left: 0.25 });
  },
  controls: [
    { title: 'Fire' },
    { key: 'm', label: 'Shell mass (kg)', min: 0.01, max: 0.1, step: 0.01 },
    { key: 'v', label: 'Shell speed (m/s)', min: 20, max: 200, step: 10 },
    { key: 'M', label: 'Gun mass (kg)', min: 20, max: 300, step: 10 },
    { readout: [
      ['Total momentum', () => '0'],
      ['Recoil speed', (s) => `${fixed(recoil(s) * 100, 2)} cm/s`],
    ] },
  ],
  tex: (s) => `MV=mv\\ \\Rightarrow\\ V=\\dfrac{${s.m}\\times${s.v}}{${s.M}}=${fixed(recoil(s), 3)}\\ \\mathrm{m/s}`,
});
