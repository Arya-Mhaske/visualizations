import { createTool } from '../../lib/tool.js';
import { bars, G } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { n: 4, dt: 0.5 };
const seg = (s, k) => 0.5 * G * s.dt * s.dt * (2 * k - 1);

createTool({
  state,
  label: 'Bars showing the distance a dropped ball falls in each equal time interval. The bars grow in the ratio 1, 3, 5, 7.',
  draw(ctx, stage, c) {
    const rows = Array.from({ length: state.n }, (_, i) => [`tick ${i + 1}`, seg(state, i + 1), i % 2 ? c.fillB : c.fillA, `${fixed(seg(state, i + 1), 2)} m  (${2 * i + 1})`]);
    bars(ctx, stage, c, rows, { max: seg(state, 8) });
  },
  controls: [
    { title: 'Drop the ball' },
    { key: 'n', label: 'Number of ticks', min: 2, max: 8, step: 1 },
    { key: 'dt', label: 'Tick length (s)', min: 0.1, max: 1, step: 0.1 },
    { readout: [
      ['Total fall', (s) => `${fixed(0.5 * G * (s.n * s.dt) ** 2, 2)} m`],
      ['First tick', (s) => `${fixed(seg(s, 1), 2)} m`],
      ['Ratio of ticks', (s) => Array.from({ length: s.n }, (_, i) => 2 * i + 1).join(' : ')],
    ] },
  ],
  tex: (s) => `y_k=\\tfrac12g(k\\Delta t)^2-\\tfrac12g((k-1)\\Delta t)^2\\propto 2k-1\\quad(k\\le ${s.n})`,
});
