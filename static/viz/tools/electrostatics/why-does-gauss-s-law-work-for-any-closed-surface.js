import { createTool } from '../../lib/tool.js';
import { line, dot, label } from '../../lib/draw.js';

// A bubble r(φ) = 2 (1 + d cos(nφ)) around the origin. A charge at (cx, 0) sends out 12 q rays. Count signed crossings of the bubble.
const state = { d: 0.3, n: 3, cx: 0, q: 2 };
const R = 2;
const N = 240;
function bubble(s) {
  return Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    const r = R * (1 + s.d * Math.cos(s.n * a));
    return [r * Math.cos(a), r * Math.sin(a)];
  });
}
// signed crossings (+1 leaving, −1 entering) of each ray with the bubble
function crossings(s) {
  const pts = bubble(s);
  const rays = 12 * s.q;
  let out = 0;
  let into = 0;
  const hits = [];
  for (let k = 0; k < rays; k++) {
    const a = (k / rays) * Math.PI * 2 + 0.01;
    const [dx, dy] = [Math.cos(a), Math.sin(a)];
    for (let i = 0; i < N; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % N];
      const [ex, ey] = [x2 - x1, y2 - y1];
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-12) continue;
      const t = ((x1 - s.cx) * ey - (y1) * ex) / den;
      const u = ((x1 - s.cx) * dy - y1 * dx) / den;
      if (t > 0 && u >= 0 && u < 1) {
        const sign = dx * ey - dy * ex > 0 ? -1 : 1; // outward normal of a counter-clockwise polygon is (ey, −ex)
        const leaving = dx * ey + dy * -ex > 0;
        void sign;
        if (leaving) out++; else into++;
        hits.push([s.cx + t * dx, t * dy, leaving]);
      }
    }
  }
  return { out, into, hits, rays };
}

createTool({
  state,
  label: 'A deformable bubble drawn around a point charge, with field lines running out from the charge. Dents and bulges in the bubble change where the lines cross it, but the number of lines leaving stays the same. If the charge is moved outside the bubble, every line that enters also leaves, so the net is zero.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const s = Math.min(W, H) / 8.5;
    const [ox, oy] = [W / 2, H / 2];
    const px = (x, y) => [ox + x * s, oy - y * s];
    const pts = bubble(state);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(...px(x, y)) : ctx.moveTo(...px(x, y))));
    ctx.closePath();
    ctx.fillStyle = c.fillY;
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 4;
    ctx.stroke();
    const cr = crossings(state);
    const rays = cr.rays;
    for (let k = 0; k < rays; k++) {
      const a = (k / rays) * Math.PI * 2 + 0.01;
      line(ctx, ...px(state.cx, 0), ...px(state.cx + Math.cos(a) * 4.2, Math.sin(a) * 4.2), { color: c.grid, width: 1.2 });
    }
    cr.hits.forEach(([x, y, leaving]) => dot(ctx, ...px(x, y), 3.5, leaving ? c.a : c.b, c.ink, 1));
    dot(ctx, ...px(state.cx, 0), 9, c.a, c.ink);
    label(ctx, '+q', ...px(state.cx, 0.7), c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Squash the surface' },
    { key: 'd', label: 'Dent depth', min: 0, max: 0.5, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'n', label: 'Number of lobes', min: 2, max: 5, step: 1 },
    { key: 'cx', label: 'Charge position x', min: -3.5, max: 3.5, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'q', label: 'Charge q', min: 1, max: 4, step: 1 },
    { readout: [
      ['Lines leaving', (s) => crossings(s).out],
      ['Lines entering', (s) => crossings(s).into],
      ['Net leaving', (s) => crossings(s).out - crossings(s).into],
      ['Charge inside', (s) => (Math.hypot(s.cx, 0) < R * (1 - s.d) ? `${s.q}` : Math.hypot(s.cx, 0) > R * (1 + s.d) ? '0' : 'on the edge: move it')],
    ] },
  ],
  tex: (s) => `\\oint\\vec E\\cdot d\\vec A=\\dfrac{q_{inside}}{\\varepsilon_0}\\ \\Rightarrow\\ \\text{net lines}=${crossings(s).out - crossings(s).into}`,
});
