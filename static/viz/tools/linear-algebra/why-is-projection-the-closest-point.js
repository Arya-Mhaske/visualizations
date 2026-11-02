import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { dot, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { norm, project, rad } from './_la-math.js';
import { plane, vec } from './_la-view.js';

// Line in the plane: a at angle α. Plane in space: spanned by a1 and a2. The closest point p has an error e = b − p that is ⟂ the target.
const state = { view: 'line', bx: 3, by: 3, bz: 3, alpha: 20, t: 1 };
const A1 = [2, 0, 0.5];
const A2 = [0, 2, 1];
const unit = (s) => [Math.cos(rad(s.alpha)), Math.sin(rad(s.alpha))];
function lineParts(s) {
  const a = unit(s);
  const k = s.bx * a[0] + s.by * a[1];
  const p = [k * a[0], k * a[1]];
  const q = [s.t * a[0], s.t * a[1]];
  return { a, k, p, q, e: [s.bx - p[0], s.by - p[1]] };
}
const planeParts = (s) => project([[A1[0], A2[0]], [A1[1], A2[1]], [A1[2], A2[2]]], [s.bx, s.by, s.bz]);

createTool({
  state,
  label: 'A point b and a line, or a point b above a plane. The closest point of the line or plane to b is the foot of the perpendicular, called p. The error vector from p to b is at a right angle to the line or plane. Any other point q on the line is further from b.',
  setup(stage, c) {
    const cam = createCamera(stage, { extent: 5, yaw: 0.7, pitch: 0.5, c });
    cam.orbit(() => stage.invalidate());
    return { plot: plane(stage, c, 5), cam };
  },
  draw(ctx, stage, c, { plot, cam }) {
    if (state.view === 'line') {
      const { a, p, q } = lineParts(state);
      plot.axes({ grid: false });
      plot.segment(-8 * a[0], -8 * a[1], 8 * a[0], 8 * a[1], { color: c.ink, width: 3 });
      plot.segment(state.bx, state.by, q[0], q[1], { color: c.d, width: 3, dash: [6, 5] });
      plot.segment(state.bx, state.by, p[0], p[1], { color: c.a, width: 5 });
      const n = [-a[1] * 0.35, a[0] * 0.35];
      const side = Math.sign((state.bx - p[0]) * n[0] + (state.by - p[1]) * n[1]) || 1;
      const m = [n[0] * side, n[1] * side];
      const [x0, y0] = plot.toPx(p[0] + a[0] * 0.35, p[1] + a[1] * 0.35);
      const [x1, y1] = plot.toPx(p[0] + a[0] * 0.35 + m[0], p[1] + a[1] * 0.35 + m[1]);
      const [x2, y2] = plot.toPx(p[0] + m[0], p[1] + m[1]);
      line(ctx, x0, y0, x1, y1, { color: c.ink, width: 2 });
      line(ctx, x1, y1, x2, y2, { color: c.ink, width: 2 });
      vec(ctx, plot, c, [0, 0], [state.bx, state.by], { color: c.b, width: 4, text: 'b' });
      dot(ctx, ...plot.toPx(...p), 7, c.fillY, c.ink);
      dot(ctx, ...plot.toPx(...q), 6, c.fillA, c.ink);
      plot.text('p', p[0] - 0.4, p[1] - 0.5, { size: 12, patch: false });
      plot.text('q', q[0] + 0.4, q[1] - 0.5, { size: 12, patch: false });
      return;
    }
    const { p } = planeParts(state);
    const b = [state.bx, state.by, state.bz];
    cam.axes({ size: 4.5 });
    const corner = (s, t) => [0, 1, 2].map((i) => s * A1[i] + t * A2[i]);
    cam.faces([{ pts: [corner(-1.6, -1.6), corner(1.6, -1.6), corner(1.6, 1.6), corner(-1.6, 1.6)], fill: c.fillB, stroke: c.grid }]);
    cam.line(b, p, { color: c.a, width: 5 });
    cam.arrow([0, 0, 0], b, { color: c.b, width: 3 });
    cam.point(p, { fill: c.fillY, r: 7 });
    cam.point(b, { fill: c.fillA, r: 7 });
    cam.label('b', b.map((v) => v * 1.08), { color: c.b });
    cam.label('p', p.map((v) => v * 1.0), { color: c.ink });
  },
  controls: [
    { title: 'Drop a perpendicular' },
    { key: 'view', label: 'Project onto', options: [['line', 'A line'], ['plane', 'A plane']] },
    { key: 'bx', label: 'b, x', min: -4, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'by', label: 'b, y', min: -4, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'bz', label: 'b, z', min: -4, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'alpha', label: 'Direction of the line', min: 0, max: 175, step: 5, format: (n) => `${n}°` },
    { key: 't', label: 'Try another point q on the line', min: -4, max: 4, step: 0.25, format: (n) => fixed(n, 2) },
    { readout: [
      ['Distance to p', (s) => fixed(s.view === 'line' ? norm(lineParts(s).e) : norm(planeParts(s).e), 3)],
      ['Distance to q', (s) => (s.view === 'line' ? fixed(Math.hypot(s.bx - lineParts(s).q[0], s.by - lineParts(s).q[1]), 3) : '—')],
      ['Error · target', (s) => ({ text: s.view === 'line' ? fixed(lineParts(s).e[0] * lineParts(s).a[0] + lineParts(s).e[1] * lineParts(s).a[1], 3) : fixed(Math.max(Math.abs(planeParts(s).e.reduce((t, v, i) => t + v * A1[i], 0)), Math.abs(planeParts(s).e.reduce((t, v, i) => t + v * A2[i], 0))), 3), good: true })],
    ] },
  ],
  tex: (s) => (s.view === 'line' ? '\\hat x=\\dfrac{\\mathbf a\\cdot\\mathbf b}{\\mathbf a\\cdot\\mathbf a},\\quad \\mathbf p=\\hat x\\,\\mathbf a,\\quad \\mathbf e=\\mathbf b-\\mathbf p\\ \\perp\\ \\mathbf a' : 'A^{\\mathsf T}A\\hat{\\mathbf x}=A^{\\mathsf T}\\mathbf b,\\quad \\mathbf p=A\\hat{\\mathbf x},\\quad \\mathbf e\\perp\\text{ every column}'),
  onChange: (s) => show(s),
});
const fields = [...document.querySelectorAll('#panel .nb-field')];
function show(s) {
  if (fields.length < 6) return;
  fields[3].hidden = s.view === 'line';
  fields[4].hidden = s.view === 'plane';
  fields[5].hidden = s.view === 'plane';
}
show(state);
