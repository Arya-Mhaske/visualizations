import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { dist, ellipsePoint, focalC } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

const state = { a: 5, b: 3, t: 40 };
const R = 7;
const c = (s = state) => focalC(s.a, s.b);
const pen = (s = state) => ellipsePoint(s.a, s.b, (s.t * Math.PI) / 180);
const atTop = (s = state) => s.t === 90;
let tool;

tool = createTool({
  state,
  label: 'An ellipse with its two foci. Move the pen to the top of the minor axis. There the two distances to the foci are equal, and they add to 2a, so each is exactly a. The centre, the top point and a focus then form a right triangle with legs b and c and hypotenuse a, so c squared plus b squared equals a squared.',
  setup: (stage, col) => createPlot(stage, { x: [-R, R], y: [-R, R], c: col, pad: 16 }),
  draw(ctx, stage, col, plot) {
    plot.axes({ xLabel: '', yLabel: '' });
    const f = c();
    curve(plot, trace((u) => ellipsePoint(state.a, state.b, u), 0, Math.PI * 2, 200), { color: col.ink, width: 4 });
    const P = pen();
    plot.segment(-f, 0, P[0], P[1], { color: col.a, width: 3 });
    plot.segment(f, 0, P[0], P[1], { color: col.b, width: 3 });
    if (atTop()) {
      const O = plot.toPx(0, 0);
      poly(ctx, [O, plot.toPx(f, 0), plot.toPx(0, state.b)], { fill: col.fillC, stroke: col.ink, width: 3 });
      plot.text('b', -0.5, state.b / 2, { size: 12, patch: false });
      plot.text('c', f / 2, -0.6, { size: 12, patch: false });
      plot.text('a', f / 2 + 0.6, state.b / 2 + 0.5, { size: 12, color: col.c, patch: false });
    }
    [-f, f].forEach((x) => plot.point(x, 0, { fill: col.c, r: 7 }));
    plot.point(P[0], P[1], { fill: col.fillY, r: 9 });
  },
  controls: [
    { title: 'Find the right triangle' },
    { key: 't', label: 'Pen position (angle)', min: 0, max: 360, step: 1, format: (n) => `${n}°` },
    { key: 'a', label: 'Semi-major axis, a', min: 3, max: 6, step: 0.5 },
    { key: 'b', label: 'Semi-minor axis, b', min: 1, max: 5.5, step: 0.5 },
    { button: 'Move the pen to the top', onClick: () => { state.t = 90; tool.update(); } },
    { text: 'The pen snaps to 90° when you get within 4° of the top.' },
    { readout: [
      ['Pen to each focus', (s) => `${fixed(dist(pen(s), [-c(s), 0]), 2)} and ${fixed(dist(pen(s), [c(s), 0]), 2)}`],
      ['At the top?', (s) => ({ text: atTop(s) ? 'yes: both distances = a' : 'not yet', good: atTop(s) })],
      ['c = √(a² − b²)', (s) => fixed(c(s), 3)],
    ] },
  ],
  onChange(s) { if (s.b >= s.a) s.b = s.a - 0.5; if (Math.abs(s.t - 90) <= 4) s.t = 90; },
  tex: (s) => `c^2=a^2-b^2=${s.a}^2-${s.b}^2=${fixed(s.a * s.a - s.b * s.b, 2)}\\Rightarrow c=${fixed(c(s), 3)}`,
});
