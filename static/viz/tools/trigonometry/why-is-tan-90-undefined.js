import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { pointAt } from './_unit-circle-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { away: 20 };
const theta = (s = state) => 90 + s.away;
const parts = (s = state) => {
  const [x, y] = pointAt(theta(s));
  return { x, y, tan: x === 0 ? NaN : y / x };
};

createTool({
  state,
  label: 'The unit circle with a point near the top. A line through the centre and the point is followed to the vertical line x equals 1, and the height where it meets that line is the tangent. As the point nears the top the line turns vertical and that height shoots off the stage. At exactly 90 degrees the line never meets it.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.5);
    drawFrame(ctx, f, c, { ticks: false });
    const p = parts();
    const P = f.px([p.x, p.y]);
    line(ctx, ...f.px([1, -1.45]), ...f.px([1, 1.45]), { color: c.b, width: 3 });
    if (Number.isNaN(p.tan)) {
      label(ctx, 'the line is vertical: it never meets x = 1', stage.w / 2, stage.h - 14, c, { size: 11, color: c.a, bounds: stage });
    } else {
      // the line through the centre and the point meets x = 1 at height tan θ; stop at the edge of the stage if that is far
      const s = Math.min(1, 1.45 / Math.abs(p.tan));
      const end = f.px([s, s * p.tan]);
      line(ctx, f.cx, f.cy, ...end, { color: c.a, width: 3 });
      if (s < 1) arrow(ctx, ...f.px([s * 0.85, s * 0.85 * p.tan]), ...end, { color: c.a, width: 3, head: 10 });
      else dot(ctx, ...end, 6, c.a, c.ink);
    }
    line(ctx, f.cx, f.cy, ...P, { color: c.d, width: 4 });
    line(ctx, ...P, ...f.px([p.x, 0]), { color: c.grid, width: 2, dash: [5, 4] });
    dot(ctx, ...P, 8, c.d, c.ink);
  },
  controls: [
    { title: 'Go near 90°' },
    { key: 'away', label: 'Angle, θ', min: -30, max: 30, step: 0.1, format: (n) => `${fixed(90 + n, 1)}°` },
    { readout: [
      ['x (= cos θ)', (s) => fixed(parts(s).x, 5)],
      ['y (= sin θ)', (s) => fixed(parts(s).y, 5)],
      ['y ÷ x (= tan θ)', (s) => (Number.isNaN(parts(s).tan) ? 'undefined: x = 0' : sig(parts(s).tan, 4))],
    ] },
  ],
  tex: (s) => (Number.isNaN(parts(s).tan) ? '\\tan 90^\\circ=\\dfrac{1}{0}\\ \\text{(undefined)}' : `\\tan\\theta=\\dfrac{y}{x}=\\dfrac{${fixed(parts(s).y, 4)}}{${fixed(parts(s).x, 4)}}=${sig(parts(s).tan, 4)}`),
});
