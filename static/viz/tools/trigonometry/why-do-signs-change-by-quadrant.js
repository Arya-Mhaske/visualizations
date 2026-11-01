import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { ASTC, normalise, pointAt, positives, quadrant, signOf } from './_unit-circle-math.js';
import { angleHandle, drawFrame, frame } from './_unit-circle-view.js';

const state = { theta: 50 };
const sign = (v) => signOf(Math.abs(v) < 1e-9 ? 0 : v);
const val = (s) => {
  const [x, y] = pointAt(s.theta);
  return { x, y, sin: y, cos: x, tan: Math.abs(x) < 1e-9 ? NaN : y / x };
};

const tool = createTool({
  state,
  label: 'The unit circle split into four quadrants. Drag the point round. The signs of x and y change as it crosses an axis, and sine, cosine and tangent follow them. Each quadrant carries the word telling which functions are positive there: All, Sin, Tan, Cos.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.55);
    const q = quadrant(state.theta);
    [[1, 1, 1], [-1, 1, 2], [-1, -1, 3], [1, -1, 4]].forEach(([sx, sy, n]) => {
      const corners = [[0, 0], [sx * 1.45, 0], [sx * 1.45, sy * 1.45], [0, sy * 1.45]].map(f.px);
      poly(ctx, corners, { fill: q === n ? c.fillY : c.paper });
      label(ctx, `${ASTC[n]}`, ...f.px([sx * 1.1, sy * 1.2]), c, { size: 12, color: q === n ? c.a : c.ink, bounds: stage, patch: false });
    });
    drawFrame(ctx, f, c, { ticks: false });
    const [x, y] = pointAt(state.theta);
    const P = f.px([x, y]);
    line(ctx, f.cx, f.cy, ...P, { color: c.a, width: 4 });
    line(ctx, ...P, ...f.px([x, 0]), { color: c.d, width: 3, dash: [5, 4] });
    line(ctx, f.cx, f.cy, ...f.px([x, 0]), { color: c.b, width: 5 });
    dot(ctx, ...P, 9, c.a, c.ink);
    label(ctx, `x ${sign(x)}`, f.px([x / 2, 0])[0], f.cy + (y >= 0 ? 14 : -14), c, { size: 11, color: c.b, bounds: stage, patch: false });
    label(ctx, `y ${sign(y)}`, P[0] + (x >= 0 ? 24 : -24), (P[1] + f.cy) / 2, c, { size: 11, color: c.d, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Drag the point, or use the slider' },
    { key: 'theta', label: 'Angle, θ', min: 0, max: 359, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Quadrant', (s) => (quadrant(s.theta) === 0 ? 'on an axis' : quadrant(s.theta))],
      ['sin, cos, tan', (s) => `${sign(val(s).sin)}  ${sign(val(s).cos)}  ${Number.isNaN(val(s).tan) ? 'undef.' : sign(val(s).tan)}`],
      ['Positive here', (s) => (quadrant(s.theta) === 0 ? '—' : ASTC[quadrant(s.theta)])],
      ['x, y', (s) => `${fixed(val(s).x, 3)}, ${fixed(val(s).y, 3)}`],
    ] },
  ],
  tex: (s) => `\\cos\\theta=x=${fixed(val(s).x, 3)},\\quad \\sin\\theta=y=${fixed(val(s).y, 3)}`,
});

handles(tool.stage, [angleHandle(() => frame(tool.stage, 1.55), () => state.theta, (t) => { state.theta = t % 360; }, () => 1)], { onChange: () => tool.update(), radius: 28 });
tool.update();
