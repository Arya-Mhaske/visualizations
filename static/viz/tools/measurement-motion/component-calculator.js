import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { A: 10, th: 37 };
const rad = (d) => (d * Math.PI) / 180;
const comp = (s) => [s.A * Math.cos(rad(s.th)), s.A * Math.sin(rad(s.th))];

createTool({
  state,
  label: 'A vector drawn from the origin with dashed lines showing its x and y components.',
  setup: (stage, c) => createPlot(stage, { x: [-11, 11], y: [-11, 11], c }),
  draw(ctx, stage, c, plot) {
    const [x, y] = comp(state);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.segment(0, 0, x, y, { color: c.a, width: 5 });
    plot.segment(0, 0, x, 0, { color: c.b, width: 3 });
    plot.segment(x, 0, x, y, { color: c.c, width: 3 });
    plot.point(x, y);
  },
  controls: [
    { title: 'The vector' },
    { key: 'A', label: 'Length A', min: 1, max: 10, step: 1 },
    { key: 'th', label: 'Angle θ (°)', min: 0, max: 360, step: 1 },
    { readout: [
      ['Aₓ = A cos θ', (s) => fixed(comp(s)[0], 2)],
      ['A_y = A sin θ', (s) => fixed(comp(s)[1], 2)],
      ['Rebuilt length', (s) => fixed(Math.hypot(...comp(s)), 2)],
      ['Rebuilt angle', (s) => `${fixed(((Math.atan2(comp(s)[1], comp(s)[0]) * 180) / Math.PI + 360) % 360, 1)}°`],
    ] },
  ],
  tex: (s) => `A_x=${s.A}\\cos${s.th}^\\circ=${fixed(comp(s)[0], 2)},\\quad A_y=${s.A}\\sin${s.th}^\\circ=${fixed(comp(s)[1], 2)}`,
});
