import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G } from './_proj.js';

const state = { vx: 10, n: 8 };
const H = 20;
const y = (t) => H - 0.5 * G * t * t;

createTool({
  state,
  label: 'Strobe positions of two balls released from the same height: one falling straight down and one thrown sideways. At each flash the two balls are at the same height, joined by a dashed horizontal line.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 40], y: [-1, 22], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-2, state.vx * 2.1 + 3], [-1, 22]);
    plot.axes({ xLabel: 'x (m)', yLabel: 'height (m)' });
    for (let k = 0; k <= state.n; k++) {
      const t = k * 0.2;
      if (y(t) < 0) break;
      plot.segment(0, y(t), state.vx * t, y(t), { color: c.grid, width: 1, dash: [4, 4] });
      plot.point(0, y(t), { fill: c.a, r: 5 });
      plot.point(state.vx * t, y(t), { fill: c.b, r: 5 });
    }
  },
  controls: [
    { title: 'Drop and throw' },
    { key: 'vx', label: 'Sideways speed (m/s)', min: 2, max: 20, step: 1 },
    { key: 'n', label: 'Flashes shown', min: 1, max: 10, step: 1 },
    { readout: [
      ['Time to land', () => `${fixed(Math.sqrt((2 * H) / G), 2)} s (both)`],
      ['Gap between flashes', (s) => `${fixed(s.vx * 0.2, 2)} m (equal)`],
      ['Dropped ball falls', () => `½gt², the same for both`],
    ] },
  ],
  tex: (s) => `x=${s.vx}t,\\qquad y=${H}-\\tfrac12gt^2`,
});
