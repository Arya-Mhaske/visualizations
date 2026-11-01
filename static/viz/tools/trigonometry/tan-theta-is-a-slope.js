import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { normalise, pointAt } from './_unit-circle-math.js';
import { tanLen } from './_tan-cot-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { theta: 30 };
const top = (stage) => ({ w: stage.w, h: stage.h * 0.55 });
const slope = (theta) => {
  const [x, y] = pointAt(theta);
  return x === 0 ? NaN : y / x;
};
const show = (v) => (Number.isNaN(v) ? 'undefined' : sig(v, 4));

createTool({
  state,
  label: 'Top: a line through the origin turned by an angle theta, with a slope triangle one unit across. Its rise is the slope, which is the tangent of theta. The line is the same one if you turn it a half-turn further. Bottom: the tangent graph with two dots, theta and theta plus 180 degrees, at the same height.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 360], y: [-5, 5], c, pad: 20, box: (g) => ({ x: 0, y: g.h * 0.57, w: g.w, h: g.h * 0.43 }),
  }),
  draw(ctx, stage, c, plot) {
    const f = frame(top(stage), 1.9);
    drawFrame(ctx, f, c, { ticks: false });
    const [x, y] = pointAt(state.theta);
    // the whole line through the origin, and the slope triangle with run 1
    const reach = 1.8;
    const m = slope(state.theta);
    if (Number.isNaN(m)) line(ctx, ...f.px([0, -reach]), ...f.px([0, reach]), { color: c.a, width: 3 });
    else {
      const s = Math.min(reach, reach / Math.abs(m));
      line(ctx, ...f.px([-s, -s * m]), ...f.px([s, s * m]), { color: c.a, width: 3 });
      if (Math.abs(m) < 1.8) {
        line(ctx, ...f.px([0, 0]), ...f.px([1, 0]), { color: c.b, width: 4 });
        line(ctx, ...f.px([1, 0]), ...f.px([1, m]), { color: c.c, width: 5 });
        label(ctx, 'run 1', f.px([0.5, 0])[0], f.px([0.5, 0])[1] + (m >= 0 ? 14 : -14), c, { size: 10, color: c.b, bounds: stage, patch: false });
        label(ctx, 'rise', f.px([1, m / 2])[0] + 18, f.px([1, m / 2])[1], c, { size: 10, color: c.c, bounds: stage, patch: false });
      }
    }
    dot(ctx, ...f.px([x, y]), 8, c.a, c.ink);
    dot(ctx, ...f.px([-x, -y]), 6, c.fillA, c.ink);
    plot.axes({ xLabel: 'θ (°)', yLabel: 'tan θ', grid: true });
    plot.segment(90, -5, 90, 5, { color: c.grid, width: 1, dash: [4, 4] });
    plot.segment(270, -5, 270, 5, { color: c.grid, width: 1, dash: [4, 4] });
    plot.fn((t) => Math.tan((t * Math.PI) / 180), { color: c.b, width: 3 });
    [state.theta, (state.theta + 180) % 360].forEach((t, i) => {
      if (!Number.isNaN(slope(t))) plot.point(t, Math.max(-4.8, Math.min(4.8, slope(t))), { fill: i ? c.fillA : c.a, r: i ? 5 : 7 });
    });
  },
  controls: [
    { title: 'Turn the line' },
    { key: 'theta', label: 'Angle of the line, θ', min: 0, max: 359, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Slope = rise ÷ run', (s) => show(slope(s.theta))],
      ['tan θ', (s) => show(tanLen(s.theta))],
      ['Slope after a half-turn', (s) => show(slope(normalise(s.theta + 180)))],
    ] },
  ],
  tex: (s) => `m=\\dfrac{\\text{rise}}{\\text{run}}=\\tan\\theta=${show(slope(s.theta))}`,
});
