import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arc, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { rad } from './_right-triangle-math.js';
import { cotLen, tanLen } from './_tan-cot-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { theta: 30 };
const top = (stage) => ({ w: stage.w, h: stage.h * 0.58 });
const EDGE = 2.0; // how far the tangent lines are drawn, in radii

createTool({
  state,
  label: 'Top: the unit circle with two tangent lines, one touching at (1, 0) and one touching at (0, 1). A ray at angle theta meets the first at height tan theta and the second at distance cot theta from the vertical axis. The angle between the ray and the vertical axis is the complement, 90 degrees minus theta. Bottom: the tan graph and the cot graph, mirror images of each other about 45 degrees.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 90], y: [0, 4], c, pad: 20, box: (g) => ({ x: 0, y: g.h * 0.6, w: g.w, h: g.h * 0.4 }),
  }),
  draw(ctx, stage, c, plot) {
    const f = frame(top(stage), 2.1);
    drawFrame(ctx, f, c, { ticks: false });
    const t = tanLen(state.theta);
    const k = cotLen(state.theta);
    line(ctx, ...f.px([1, -0.3]), ...f.px([1, EDGE]), { color: c.ink, width: 2 });
    line(ctx, ...f.px([-0.3, 1]), ...f.px([EDGE, 1]), { color: c.ink, width: 2 });
    // the ray, to the nearer tangent line (solid), then on to the other (dashed), kept on the stage
    const near = state.theta <= 45 ? [1, t] : [k, 1];
    const far = state.theta <= 45 ? [k, 1] : [1, t];
    const reach = Math.min(1, EDGE / Math.max(Math.abs(far[0]), Math.abs(far[1])));
    line(ctx, f.cx, f.cy, ...f.px(near), { color: c.a, width: 3 });
    line(ctx, ...f.px(near), ...f.px([far[0] * reach, far[1] * reach]), { color: c.a, width: 2, dash: [5, 4] });
    line(ctx, ...f.px([1, 0]), ...f.px([1, Math.min(t, EDGE)]), { color: c.b, width: 6 });
    line(ctx, ...f.px([0, 1]), ...f.px([Math.min(k, EDGE), 1]), { color: c.c, width: 6 });
    arc(ctx, f.cx, f.cy, 40, -rad(90), -rad(state.theta), { color: c.c, width: 3 });
    arc(ctx, f.cx, f.cy, 26, -rad(state.theta), 0, { color: c.b, width: 3 });
    if (t <= EDGE) dot(ctx, ...f.px([1, t]), 7, c.b, c.ink);
    if (k <= EDGE) dot(ctx, ...f.px([k, 1]), 7, c.c, c.ink);
    label(ctx, 'tan θ', f.px([1, Math.min(t, EDGE) / 2])[0] + 26, f.px([1, Math.min(t, EDGE) / 2])[1], c, { size: 11, color: c.b, bounds: stage, patch: false });
    label(ctx, 'cot θ', f.px([Math.min(k, EDGE) / 2, 1])[0], f.px([Math.min(k, EDGE) / 2, 1])[1] - 12, c, { size: 11, color: c.c, bounds: stage, patch: false });
    label(ctx, `${90 - state.theta}°`, f.cx + 12, f.cy - 56, c, { size: 11, color: c.c, bounds: stage, patch: false });
    plot.axes({ xLabel: 'θ (°)', yLabel: 'value', grid: true });
    plot.fn((x) => tanLen(x), { color: c.b, width: 3 });
    plot.fn((x) => cotLen(x), { color: c.c, width: 3 });
    plot.point(state.theta, Math.min(t, 3.9), { fill: c.b, r: 6 });
    plot.point(90 - state.theta, Math.min(t, 3.9), { fill: c.paper, r: 5 });
    plot.point(state.theta, Math.min(k, 3.9), { fill: c.c, r: 6 });
  },
  controls: [
    { title: 'Turn the ray' },
    { key: 'theta', label: 'Angle, θ', min: 15, max: 75, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['tan θ', (s) => fixed(tanLen(s.theta), 4)],
      ['cot θ', (s) => fixed(cotLen(s.theta), 4)],
      ['tan(90° − θ)', (s) => fixed(tanLen(90 - s.theta), 4)],
      ['cot θ × tan θ', (s) => fixed(cotLen(s.theta) * tanLen(s.theta), 4)],
    ] },
  ],
  tex: (s) => `\\cot\\theta=\\tan(90^\\circ-\\theta)=\\tan ${90 - s.theta}^\\circ=${fixed(cotLen(s.theta), 4)}`,
});
