import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { label } from '../../lib/draw.js';

// Maximise f = x + 2y + 3z on the curve where the plane x − y + z = 1 meets the cylinder x² + y² = 1.
// At a best point ∇f lies in the plane spanned by ∇g and ∇h: ∇f = λ∇g + μ∇h, i.e. the triple product [∇f, ∇g, ∇h] is 0.
const state = { t: 40 };
const GF = [1, 2, 3];
const GG = [1, -1, 1];
export const point = (deg) => { const t = (deg * Math.PI) / 180; const x = Math.cos(t); const y = Math.sin(t); return [x, y, 1 - x + y]; };
export const fval = (deg) => { const p = point(deg); return p[0] + 2 * p[1] + 3 * p[2]; };
const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
export function stats(deg) {
  const p = point(deg);
  const GH = [2 * p[0], 2 * p[1], 0];
  const triple = dot(GF, cross(GG, GH));
  // least squares for λ, μ in ∇f ≈ λ∇g + μ∇h
  const [a, b, d] = [dot(GG, GG), dot(GG, GH), dot(GH, GH)];
  const [r1, r2] = [dot(GG, GF), dot(GH, GF)];
  const det = a * d - b * b;
  const lambda = (r1 * d - r2 * b) / det;
  const mu = (a * r2 - b * r1) / det;
  return { p, GH, triple, lambda, mu, f: fval(deg) };
}

const tool = createTool({
  state,
  label: 'A cylinder and a tilted plane meeting in a closed curve. A point slides round the curve with three arrows: the gradient of f, and the gradients of the two constraints. They lie in one plane only at the best and worst points of f on the curve.',
  setup: (stage, c) => createCamera(stage, { extent: 3.6, yaw: 0.8, pitch: 0.5, c }),
  draw(ctx, stage, c, cam) {
    cam.axes({ size: 2.6 });
    for (let k = 0; k < 72; k++) cam.line(point(k * 5), point((k + 1) * 5), { color: c.ink, width: 4 });
    [-1, 3].forEach((z) => { for (let k = 0; k < 36; k++) { const a = (k * 10 * Math.PI) / 180; const b = ((k + 1) * 10 * Math.PI) / 180; cam.line([Math.cos(a), Math.sin(a), z], [Math.cos(b), Math.sin(b), z], { color: c.grid, width: 1.5 }); } });
    const s = stats(state.t);
    const add = (v, k) => s.p.map((q, i) => q + v[i] * k);
    cam.arrow(s.p, add(GF, 0.35), { color: c.a, width: 4 });
    cam.arrow(s.p, add(GG, 0.5), { color: c.b, width: 3 });
    cam.arrow(s.p, add(s.GH, 0.5), { color: c.c, width: 3 });
    cam.point(s.p);
    cam.label('∇f', add(GF, 0.4), { color: c.a });
  },
  controls: [
    { title: 'Slide along the curve' },
    { key: 't', label: 'Position (angle round the cylinder)', min: 0, max: 360, step: 1, format: (v) => `${v}°` },
    { readout: [
      ['f at the point', (s) => stats(s.t).f.toFixed(3)],
      ['[∇f, ∇g, ∇h]', (s) => stats(s.t).triple.toFixed(3)],
      ['λ and μ (best fit)', (s) => `${stats(s.t).lambda.toFixed(2)}, ${stats(s.t).mu.toFixed(2)}`],
      ['Best possible', () => `3 ± √29 = ${(3 + Math.sqrt(29)).toFixed(3)}, ${(3 - Math.sqrt(29)).toFixed(3)}`],
    ] },
  ],
  tex: () => '\\nabla f=\\lambda\\nabla g+\\mu\\nabla h',
});
tool.extra.orbit(tool.update);
void label;
