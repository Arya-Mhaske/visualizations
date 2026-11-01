import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow, dot, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { pointAt } from './_unit-circle-math.js';
import { tanLen } from './_tan-cot-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { theta: 70 };
const top = (stage) => ({ w: stage.w, h: stage.h * 0.56 });

createTool({
  state,
  label: 'Top: the unit circle, the tangent line at (1, 0) and a ray that meets it. As the angle approaches 90 degrees the ray turns parallel to the tangent line, so the meeting point runs off the top. Bottom: the graph of tangent against the angle, rising without limit as it approaches the dashed asymptote at 90 degrees.',
  setup: (stage, c) => createPlot(stage, {
    x: [-90, 90], y: [-6, 6], c, pad: 20, box: (g) => ({ x: 0, y: g.h * 0.58, w: g.w, h: g.h * 0.42 }),
  }),
  draw(ctx, stage, c, plot) {
    const f = frame(top(stage), 1.7);
    drawFrame(ctx, f, c, { ticks: false });
    line(ctx, ...f.px([1, -1.6]), ...f.px([1, 1.6]), { color: c.ink, width: 2 });
    const t = tanLen(state.theta);
    const s = Math.min(1, 1.6 / Math.abs(t));
    const end = f.px([s, s * t]);
    line(ctx, f.cx, f.cy, ...end, { color: c.a, width: 3 });
    if (s < 1) arrow(ctx, ...f.px([s * 0.85, s * 0.85 * t]), ...end, { color: c.a, width: 3, head: 9 });
    else dot(ctx, ...end, 6, c.a, c.ink);
    dot(ctx, ...f.px(pointAt(state.theta)), 7, c.paper, c.ink);
    plot.axes({ xLabel: 'θ (°)', yLabel: 'tan θ', grid: true });
    plot.segment(90, -6, 90, 6, { color: c.a, width: 2, dash: [6, 5] });
    plot.segment(-90, -6, -90, 6, { color: c.a, width: 2, dash: [6, 5] });
    plot.fn((x) => Math.tan((x * Math.PI) / 180), { color: c.b, width: 3 });
    plot.point(state.theta, Math.max(-5.8, Math.min(5.8, t)), { fill: c.a, r: 7 });
  },
  controls: [
    { title: 'Push θ towards 90°' },
    { key: 'theta', label: 'Angle, θ', min: -89.9, max: 89.9, step: 0.1, format: (n) => `${fixed(n, 1)}°` },
    { readout: [
      ['tan θ', (s) => sig(tanLen(s.theta), 4)],
      ['Gap to 90°', (s) => `${fixed(90 - Math.abs(s.theta), 1)}°`],
      ['Ray and tangent line', (s) => (90 - Math.abs(s.theta) < 5 ? 'almost parallel' : 'they meet')],
    ] },
  ],
  tex: (s) => `\\tan ${fixed(s.theta, 1)}^\\circ=${sig(tanLen(s.theta), 4)}`,
});
