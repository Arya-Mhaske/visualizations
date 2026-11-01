import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Cycloid of a unit wheel: x = t - sin t, y = 1 - cos t
const X = (t) => t - Math.sin(t);
const Y = (t) => 1 - Math.cos(t);
const dX = (t) => 1 - Math.cos(t);
const dY = (t) => Math.sin(t);
const state = { t: 3 };
const speed = (t) => Math.hypot(dX(t), dY(t));

createTool({
  state,
  label: 'A wheel of radius 1 rolling along the ground with a point marked on its rim. The path of that point is a cycloid. An arrow shows the point velocity. Each time the point touches the ground both parts of its velocity are zero, the point stops dead for an instant, and the path has a sharp cusp.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 13.5], y: [-0.5, 2.5], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    const pad = 14;
    const spanX = 14;
    const spanY = (spanX * (stage.h - pad * 2)) / (stage.w - pad * 2);
    plot.setRange([-0.5, 13.5], [1 - spanY / 2, 1 + spanY / 2]);
    plot.segment(-0.5, 0, 13.5, 0, { color: c.ink, width: 3 });
    for (let i = 1; i <= 400; i++) {
      const a = (13 * (i - 1)) / 400;
      const b = (13 * i) / 400;
      plot.segment(X(a), Y(a), X(b), Y(b), { color: i * 13 / 400 <= state.t ? c.a : c.grid, width: 3 });
    }
    const t = state.t;
    const rim = Array.from({ length: 61 }, (_, i) => plot.toPx(t + Math.cos((i / 60) * Math.PI * 2) , 1 + Math.sin((i / 60) * Math.PI * 2)));
    poly(ctx, rim, { stroke: c.b, width: 3 });
    plot.segment(t, 1, X(t), Y(t), { color: c.b, width: 2 });
    plot.segment(X(t), Y(t), X(t) + dX(t) * 0.6, Y(t) + dY(t) * 0.6, { color: c.c, width: 5 });
    plot.point(X(t), Y(t), { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Roll the wheel' },
    { key: 't', label: 'Wheel has turned', min: 0, max: 13, step: 0.05, format: (v) => `${fixed(v, 2)} rad` },
    { readout: [
      ['x′ = 1 − cos t', (s) => fixed(dX(s.t), 3)],
      ['y′ = sin t', (s) => fixed(dY(s.t), 3)],
      ['Speed of the point', (s) => ({ text: fixed(speed(s.t), 3), good: speed(s.t) > 0.1 })],
    ] },
  ],
  tex: (s) => `x'=${fixed(dX(s.t), 3)},\\ y'=${fixed(dY(s.t), 3)}\\ \\Rightarrow\\ \\text{speed}=2\\left|\\sin\\tfrac t2\\right|=${fixed(speed(s.t), 3)}`,
});
