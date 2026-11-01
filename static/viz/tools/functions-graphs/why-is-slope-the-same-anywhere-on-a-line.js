import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { m: 1.5, b: -1, x0: -3, run: 2 };
const R = 8;
const y = (x) => state.m * x + state.b;

createTool({
  state,
  label: 'A straight line with a right triangle sitting on it: the run is the horizontal side and the rise is the vertical side. Slide the triangle along the line or change its size. Every such triangle is similar to the others, so the rise divided by the run is always the same number, the slope.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn(y, { color: c.a, width: 4 });
    const [x1, x2] = [state.x0, state.x0 + state.run];
    poly(ctx, [plot.toPx(x1, y(x1)), plot.toPx(x2, y(x1)), plot.toPx(x2, y(x2))], { fill: c.fillC, stroke: c.ink, width: 3 });
    plot.point(x1, y(x1), { fill: c.fillY, r: 7 });
    plot.point(x2, y(x2), { fill: c.fillY, r: 7 });
    plot.text(`run ${fixed(state.run, 1)}`, (x1 + x2) / 2, y(x1) - 0.8, { size: 11, patch: false });
    plot.text(`rise ${fixed(y(x2) - y(x1), 2)}`, x2 + 0.4, (y(x1) + y(x2)) / 2, { size: 11, align: 'left', patch: false });
  },
  controls: [
    { title: 'Slide the triangle' },
    { key: 'x0', label: 'Start of the triangle, x', min: -6, max: 4, step: 0.5 },
    { key: 'run', label: 'Run', min: 0.5, max: 4, step: 0.5 },
    { key: 'm', label: 'Steepness of the line, m', min: -3, max: 3, step: 0.5 },
    { readout: [
      ['Rise', (s) => fixed(s.m * s.run, 3)],
      ['Run', (s) => fixed(s.run, 3)],
      ['Rise ÷ run', (s) => ({ text: fixed((s.m * s.run) / s.run, 3), good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{\\text{rise}}{\\text{run}}=\\dfrac{${fixed(s.m * s.run, 2)}}{${fixed(s.run, 1)}}=${fixed(s.m, 2)}`,
});
