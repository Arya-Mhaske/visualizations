import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { cloud, linearFit, sse } from './_modelling-math.js';

const PTS = cloud(5, 9, 0.8, 1.1);
const BEST = linearFit(PTS);
const state = { m: 0.2, b: 1 };
let tool;
const line = (s, x) => s.m * x + s.b;

tool = createTool({
  state,
  label: 'Nine data points and a line that you can tilt and slide. From each point a real square is drawn whose side is the vertical gap between the point and the line. The total area of all the squares is the number to make small. Try to make the squares as small as you can. The best-fit line is the one with the smallest total square area, and a button shows it.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-6, 6], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-6, 6], [-6, 6]);
    plot.axes();
    PTS.forEach(([x, y]) => {
      const r = y - line(state, x);
      const s = Math.abs(r);
      const px = (u, v) => plot.toPx(u, v);
      poly(ctx, [px(x, y), px(x, line(state, x)), px(x + s, line(state, x)), px(x + s, y)], { fill: c.fillA, stroke: c.ink, width: 1 });
    });
    plot.fn((x) => line(state, x), { color: c.a, width: 4 });
    PTS.forEach(([x, y]) => plot.point(x, y, { fill: c.b, r: 6 }));
  },
  controls: [
    { title: 'Fit a line' },
    { key: 'm', label: 'Slope, m', min: -2, max: 2, step: 0.05 },
    { key: 'b', label: 'Intercept, b', min: -4, max: 4, step: 0.05 },
    { button: 'Show the best-fit line', onClick: () => { state.m = BEST.m; state.b = BEST.b; tool.update(); } },
    { readout: [
      ['Total square area', (s) => fixed(sse(PTS, (x) => line(s, x)), 3)],
      ['Smallest possible', () => ({ text: fixed(sse(PTS, (x) => BEST.m * x + BEST.b), 3), good: true })],
      ['Best line', () => `y = ${fixed(BEST.m, 3)}x + ${fixed(BEST.b, 3)}`],
    ] },
  ],
  tex: (s) => `\\sum(y_i-(${fixed(s.m, 2)}x_i+${fixed(s.b, 2)}))^2=${fixed(sse(PTS, (x) => line(s, x)), 3)}`,
});
