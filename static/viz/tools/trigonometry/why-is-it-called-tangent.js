import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { pointAt } from './_unit-circle-math.js';
import { secantLength, tanLen } from './_tan-cot-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { theta: 35 };

createTool({
  state,
  label: 'The unit circle with a vertical line touching it at the point (1, 0): the tangent line. A ray from the centre at angle theta cuts the circle and goes on to meet that line. The piece of the tangent line from (1, 0) up to the ray has length tan theta. The whole ray from the centre to the tangent line has length sec theta. These are the original meanings of the names.',
  draw(ctx, stage, c) {
    const f = frame(stage, 2.15);
    drawFrame(ctx, f, c, { ticks: false });
    const t = tanLen(state.theta);
    const Q = f.px([1, t]);
    const P = f.px(pointAt(state.theta));
    line(ctx, ...f.px([1, -2.05]), ...f.px([1, 2.05]), { color: c.ink, width: 2 });
    line(ctx, f.cx, f.cy, ...Q, { color: c.b, width: 4 });
    line(ctx, ...f.px([1, 0]), ...Q, { color: c.a, width: 7 });
    line(ctx, f.cx, f.cy, ...f.px([1, 0]), { color: c.grid, width: 2, dash: [4, 4] });
    dot(ctx, ...f.px([1, 0]), 5, c.ink, c.ink);
    dot(ctx, ...P, 7, c.paper, c.ink);
    dot(ctx, ...Q, 8, c.a, c.ink);
    label(ctx, 'tan θ', f.px([1, t / 2])[0] + 28, f.px([1, t / 2])[1], c, { size: 12, color: c.a, bounds: stage, patch: false });
    label(ctx, 'sec θ', (f.cx + Q[0]) / 2 - 8, (f.cy + Q[1]) / 2 - 14, c, { size: 12, color: c.b, bounds: stage, patch: false });
    label(ctx, 'touches the circle at (1, 0)', f.px([1, -1.75])[0] - 10, f.px([1, -1.75])[1], c, { size: 10, align: 'right', bounds: stage, patch: false });
  },
  controls: [
    { title: 'Turn the ray' },
    { key: 'theta', label: 'Angle, θ', min: -60, max: 60, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['tan θ (tangent piece)', (s) => fixed(tanLen(s.theta), 4)],
      ['sec θ (ray to the line)', (s) => fixed(secantLength(s.theta), 4)],
      ['1 + tan²θ', (s) => fixed(1 + tanLen(s.theta) ** 2, 4)],
      ['sec²θ', (s) => fixed(secantLength(s.theta) ** 2, 4)],
    ] },
  ],
  tex: (s) => `1+\\tan^2\\theta=1+${fixed(tanLen(s.theta) ** 2, 3)}=${fixed(secantLength(s.theta) ** 2, 3)}=\\sec^2\\theta`,
});
