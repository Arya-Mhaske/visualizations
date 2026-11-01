import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { t: 1 };
const circle = (u) => [Math.cos(u), Math.sin(u)];
const hyper = (u) => [Math.cosh(u), Math.sinh(u)];

// Points of a curve u -> [x, y] for u from a to b.
const trace = (curve, a, b, n = 60) => Array.from({ length: n + 1 }, (_, i) => curve(a + ((b - a) * i) / n));

createTool({
  state,
  label: 'On equal axes, the point cos t, sin t moves on the unit circle and the point cosh t, sinh t moves on the right branch of the hyperbola x squared minus y squared equals 1. Both are controlled by the same number t, and the shaded sector beside each has area t over 2.',
  setup: (stage, c) => createPlot(stage, { x: [-3.5, 3.5], y: [-3.5, 3.5], c }),
  draw(ctx, stage, c, plot) {
    const t = state.t;
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.segment(-3.5, -3.5, 3.5, 3.5, { color: c.grid, width: 1, dash: [6, 5] });
    plot.segment(-3.5, 3.5, 3.5, -3.5, { color: c.grid, width: 1, dash: [6, 5] });
    const px = (pts) => pts.map(([x, y]) => plot.toPx(x, y));
    const origin = plot.toPx(0, 0);
    poly(ctx, [origin, ...px(trace(circle, 0, t))], { fill: c.fillB });
    poly(ctx, [origin, ...px(trace(hyper, 0, t))], { fill: c.fillA });
    for (const [curve, color, lim] of [[circle, c.b, Math.PI], [hyper, c.a, 1.9]]) {
      const pts = px(trace(curve, curve === circle ? -lim : -lim, lim, 160));
      poly(ctx, pts, { stroke: color, width: 4, closed: false });
    }
    const [cx, cy] = circle(t);
    const [hx, hy] = hyper(t);
    plot.segment(0, 0, cx, cy, { color: c.ink, width: 2 });
    plot.segment(0, 0, hx, hy, { color: c.ink, width: 2 });
    plot.point(cx, cy, { fill: c.b, r: 8 });
    plot.point(hx, hy, { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Move both points' },
    { key: 't', label: 't', min: -1.9, max: 1.9, step: 0.05, format: (v) => fixed(v, 2) },
    { readout: [
      ['cos² t + sin² t', (s) => fixed(Math.cos(s.t) ** 2 + Math.sin(s.t) ** 2, 4)],
      ['cosh² t − sinh² t', (s) => fixed(Math.cosh(s.t) ** 2 - Math.sinh(s.t) ** 2, 4)],
      ['Each shaded area', (s) => ({ text: fixed(s.t / 2, 3), good: true })],
      ['Hyperbola point', (s) => `(${fixed(Math.cosh(s.t), 2)}, ${fixed(Math.sinh(s.t), 2)})`],
    ] },
  ],
  tex: (s) => `x^2+y^2=${fixed(Math.cos(s.t) ** 2, 3)}+${fixed(Math.sin(s.t) ** 2, 3)}=1\\qquad x^2-y^2=${fixed(Math.cosh(s.t) ** 2, 3)}-${fixed(Math.sinh(s.t) ** 2, 3)}=1`,
});
