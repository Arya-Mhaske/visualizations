import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { handles } from '../../lib/stage.js';
import { ngonPoints } from './_aa-view.js';

// The symmetries of a regular n-gon move a point around. The points it can reach form its orbit.
// The symmetries that leave it where it is form its stabiliser. Always: |orbit| × |stabiliser| = |group| = 2n.
const state = { n: 5 };
const point = { r: 0.7, theta: 0.5 };
const TAU = 2 * Math.PI;

export function orbit(n, r, theta) {
  const out = [];
  const add = (t) => {
    const p = [r * Math.cos(t), r * Math.sin(t)];
    if (!out.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-6)) out.push(p);
  };
  for (let k = 0; k < n; k++) { add(theta + (TAU * k) / n); add((TAU * k) / n - theta); }
  return out;
}
const stabiliser = (s) => (2 * s.n) / orbit(s.n, point.r, point.theta).length;

const tool = createTool({
  state,
  label: 'A regular polygon with its mirror lines. A coral point can be dragged anywhere. The blue points are everywhere the polygon symmetries can move it: its orbit. A point on a mirror line or at the centre has fewer images.',
  setup(stage) {
    const frame = () => ({ cx: stage.w / 2, cy: stage.h / 2, s: Math.min(stage.w, stage.h) * 0.4 });
    handles(stage, [{
      at() { const { cx, cy, s } = frame(); return [cx + point.r * s * Math.cos(point.theta), cy - point.r * s * Math.sin(point.theta)]; },
      move(px, py) {
        const { cx, cy, s } = frame();
        let [x, y] = [(px - cx) / s, (cy - py) / s];
        let r = Math.min(Math.hypot(x, y), 1.05);
        let theta = Math.atan2(y, x);
        if (r < 0.1) r = 0;
        const axis = Math.PI / state.n;
        const nearest = Math.round(theta / axis) * axis;
        if (Math.abs(theta - nearest) < 0.07) theta = nearest;
        point.r = r;
        point.theta = theta;
        void x; void y;
      },
      keyStep: 5,
    }], { onChange: () => tool.update() });
    return null;
  },
  draw(ctx, stage, c) {
    const [cx, cy, s] = [stage.w / 2, stage.h / 2, Math.min(stage.w, stage.h) * 0.4];
    const px = ([x, y]) => [cx + x * s, cy - y * s];
    poly(ctx, ngonPoints(cx, cy, s, state.n, 0), { fill: c.paper, stroke: c.ink, width: 3 });
    for (let k = 0; k < state.n; k++) {
      const a = (Math.PI * k) / state.n;
      line(ctx, ...px([-1.12 * Math.cos(a), -1.12 * Math.sin(a)]), ...px([1.12 * Math.cos(a), 1.12 * Math.sin(a)]), { color: c.grid, width: 1.5, dash: [5, 4] });
    }
    const pts = orbit(state.n, point.r, point.theta);
    pts.forEach((p, i) => { const [x, y] = px(p); dot(ctx, x, y, 8, c.fillB, c.ink, 2); void i; });
    const [x0, y0] = px([point.r * Math.cos(point.theta), point.r * Math.sin(point.theta)]);
    dot(ctx, x0, y0, 11, c.a, c.ink);
    label(ctx, 'drag the coral point', stage.w / 2, 14, c, { size: 12 });
    label(ctx, `${pts.length} points in the orbit`, stage.w / 2, stage.h - 14, c, { size: 12 });
  },
  controls: [
    { title: 'The polygon' },
    { key: 'n', label: 'Sides, n', min: 3, max: 8, step: 1 },
    { readout: [
      ['Group size |G|', (s) => String(2 * s.n)],
      ['Orbit size', (s) => String(orbit(s.n, point.r, point.theta).length)],
      ['Stabiliser size', (s) => String(stabiliser(s))],
      ['|orbit| × |stabiliser|', (s) => `${orbit(s.n, point.r, point.theta).length} × ${stabiliser(s)} = ${orbit(s.n, point.r, point.theta).length * stabiliser(s)}`],
    ] },
  ],
  tex: (s) => `|\\mathrm{orbit}|\\cdot|\\mathrm{Stab}|=|G|:\\ ${orbit(s.n, point.r, point.theta).length}\\cdot ${stabiliser(s)}=${2 * s.n}`,
});
