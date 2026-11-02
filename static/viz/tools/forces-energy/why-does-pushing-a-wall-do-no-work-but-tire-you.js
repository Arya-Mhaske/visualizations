import { createTool } from '../../lib/tool.js';
import { bars } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { F: 100, d: 0, t: 10 };

createTool({
  state,
  label: 'Bars comparing the physical work done on whatever you push with a rough, illustrative estimate of the energy your muscles use. With no displacement the work is zero but the body still spends energy.',
  draw(ctx, stage, c) {
    bars(ctx, stage, c, [['work F·d', state.F * state.d, c.fillC, `${fixed(state.F * state.d, 0)} J`], ['body energy used', state.F * state.t * 0.5, c.fillA, `~${fixed(state.F * state.t * 0.5, 0)} J`]], { max: 1500 });
  },
  controls: [
    { title: 'Push' },
    { key: 'F', label: 'Force F (N)', min: 10, max: 200, step: 10 },
    { key: 'd', label: 'Displacement d (m)', min: 0, max: 5, step: 0.5 },
    { key: 't', label: 'Time pushing (s)', min: 1, max: 20, step: 1 },
    { readout: [
      ['Work done on it', (s) => `${fixed(s.F * s.d, 0)} J`],
      ['Wall (d = 0)', () => '0 J'],
    ] },
  ],
  tex: (s) => `W=Fd=${s.F}\\times${s.d}=${fixed(s.F * s.d, 0)}\\ \\mathrm{J}`,
});
