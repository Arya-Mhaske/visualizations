import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';

// The level surface F(x, y, z) = 1 with F = x²/a² + y²/b² + z²/c². On it F never changes, so for any path r(t) lying in the surface,
// d/dt F(r(t)) = ∇F · r′(t) = 0: the gradient is perpendicular to every tangent direction.
const SHAPES = { ball: [2, 2, 2], egg: [3, 2, 1.5], pancake: [3, 3, 1] };
const state = { shape: 'egg', lon: 40, lat: 35, psi: 30 };
const D = (deg) => (deg * Math.PI) / 180;
const pointAt = (a, b, c, th, ph) => [a * Math.sin(ph) * Math.cos(th), b * Math.sin(ph) * Math.sin(th), c * Math.cos(ph)];
const Fgrad = ([a, b, c], [x, y, z]) => [(2 * x) / (a * a), (2 * y) / (b * b), (2 * z) / (c * c)];
const dot3 = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const norm3 = (u) => Math.hypot(...u);
export function path(shape, th, ph, psi, s) {
  const [a, b, c] = SHAPES[shape];
  return pointAt(a, b, c, th + s * Math.cos(psi), Math.min(Math.PI - 0.01, Math.max(0.01, ph + s * Math.sin(psi))));
}
export function tangent(shape, th, ph, psi) {
  const h = 1e-5;
  const p = path(shape, th, ph, psi, h);
  const q = path(shape, th, ph, psi, -h);
  return [0, 1, 2].map((i) => (p[i] - q[i]) / (2 * h));
}
const stuff = () => {
  const [a, b, c] = SHAPES[state.shape];
  const [th, ph, psi] = [D(state.lon), D(state.lat + 5), D(state.psi)];
  const P = pointAt(a, b, c, th, ph);
  const g = Fgrad([a, b, c], P);
  const T = tangent(state.shape, th, ph, psi);
  return { P, g, T, a, b, c, th, ph, psi };
};

const tool = createTool({
  state,
  label: 'A closed surface with a point on it. A coral arrow is the gradient of F at the point, standing straight out from the surface. A blue curve on the surface and its tangent show a path through the point. The gradient and the tangent are at a right angle for every path.',
  setup: (stage, c) => createCamera(stage, { extent: 4.4, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const { P, g, T, a, b, c: cc, th, ph, psi } = stuff();
    const faces = [];
    const N = 14;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const at = (u, v) => pointAt(a, b, cc, (2 * Math.PI * u) / N, (Math.PI * v) / N);
      faces.push({ pts: [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)], fill: (i + j) % 2 ? c.fillB : c.fillY, stroke: c.grid, width: 1 });
    }
    cam.faces(faces);
    for (let k = -20; k < 20; k++) cam.line(path(state.shape, th, ph, psi, k * 0.03), path(state.shape, th, ph, psi, (k + 1) * 0.03), { color: c.b, width: 4 });
    const gl = norm3(g);
    cam.arrow(P, P.map((v, i) => v + (g[i] / gl) * 1.8), { color: c.a, width: 4 });
    const tl = norm3(T);
    cam.arrow(P, P.map((v, i) => v + (T[i] / tl) * 1.4), { color: c.b, width: 3 });
    cam.point(P);
  },
  controls: [
    { title: 'Choose a point and a path' },
    { key: 'shape', label: 'Surface', options: [['ball', 'Ball'], ['egg', 'Egg'], ['pancake', 'Pancake']] },
    { key: 'lon', label: 'Around (longitude)', min: 0, max: 360, step: 5, format: (v) => `${v}°` },
    { key: 'lat', label: 'Down from the top', min: 5, max: 165, step: 5, format: (v) => `${v}°` },
    { key: 'psi', label: 'Direction of the path', min: 0, max: 360, step: 5, format: (v) => `${v}°` },
    { readout: [
      ['∇F', () => stuff().g.map((v) => v.toFixed(2)).join(', ')],
      ['Path tangent', () => stuff().T.map((v) => v.toFixed(2)).join(', ')],
      ['∇F · tangent', () => { const { g, T } = stuff(); return (dot3(g, T)).toExponential(1); }],
      ['Angle between them', () => { const { g, T } = stuff(); return `${((Math.acos(dot3(g, T) / (norm3(g) * norm3(T))) * 180) / Math.PI).toFixed(1)}°`; }],
    ] },
  ],
  tex: () => '\\frac{d}{dt}F(\\mathbf r(t))=\\nabla F\\cdot\\mathbf r\'(t)=0',
});
tool.extra.orbit(tool.update);
