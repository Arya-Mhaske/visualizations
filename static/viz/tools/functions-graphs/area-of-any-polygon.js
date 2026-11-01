import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { grab } from './_fx.js';

const state = { x0: -5, y0: -3, x1: 4, y1: -4, x2: 6, y2: 2, x3: 1, y3: 6, x4: -4, y4: 3 };
const R = 8;
const P = (s = state) => [[s.x0, s.y0], [s.x1, s.y1], [s.x2, s.y2], [s.x3, s.y3], [s.x4, s.y4]];
const tri = (a, b, c) => Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2;
const fan = (s = state) => [tri(P(s)[0], P(s)[1], P(s)[2]), tri(P(s)[0], P(s)[2], P(s)[3]), tri(P(s)[0], P(s)[3], P(s)[4])];
const shoelace = (s = state) => Math.abs(P(s).reduce((t, p, i) => { const q = P(s)[(i + 1) % 5]; return t + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const sum = (s) => fan(s).reduce((a, b) => a + b, 0);

const tool = createTool({
  state,
  label: 'A five-sided polygon with corners you can drag. Lines from the first corner to the others cut it into three triangles, drawn in different colours. The area of each triangle is easy to find, and the polygon\'s area is their sum. A second method, the shoelace formula, gives the polygon\'s area directly from the coordinates. The two agree as long as the triangles stay inside the polygon.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '', grid: false });
    const p = P();
    [[1, 2, c.fillA], [2, 3, c.fillB], [3, 4, c.fillC]].forEach(([i, j, fill]) => poly(ctx, [p[0], p[i], p[j]].map((q) => plot.toPx(...q)), { fill, stroke: c.ink, width: 2 }));
    poly(ctx, p.map((q) => plot.toPx(...q)), { stroke: c.ink, width: 3 });
    p.forEach(([x, y], i) => { plot.point(x, y, { fill: c.paper, r: 8 }); plot.text(`P${i + 1}`, x + 0.5, y + 0.7, { size: 11, patch: false }); });
  },
  controls: [
    { title: 'Drag the corners' },
    { text: 'Drag P1 to P5. Enter switches corner; arrow keys nudge it.' },
    { readout: [
      ['Triangle areas', (s) => fan(s).map((a) => fixed(a, 2)).join(' + ')],
      ['Sum', (s) => fixed(sum(s), 3)],
      ['Shoelace formula', (s) => ({ text: fixed(shoelace(s), 3), good: Math.abs(sum(s) - shoelace(s)) < 1e-6 })],
    ] },
  ],
  tex: (s) => `${fan(s).map((a) => fixed(a, 2)).join('+')}=${fixed(sum(s), 2)}`,
});

handles(tool.stage, [0, 1, 2, 3, 4].map((i) => grab(tool, state, `x${i}`, `y${i}`)), { onChange: () => tool.update(), radius: 24 });
tool.update();
