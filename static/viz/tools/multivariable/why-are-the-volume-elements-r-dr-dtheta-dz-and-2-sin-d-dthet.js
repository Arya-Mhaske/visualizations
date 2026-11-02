import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';

// A coordinate box: each coordinate runs over a short interval. Cylindrical: edges Δr, r Δθ (an arc), Δz → volume ≈ r Δr Δθ Δz.
// Spherical: edges Δρ, ρ Δφ, ρ sin φ Δθ → volume ≈ ρ² sin φ Δρ Δθ Δφ. The arcs get longer further out, so the boxes get bigger.
const state = { mode: 'cyl', a: 2, b: 40, c: 40, size: 0.5 };
const MAPS = {
  cyl: (r, th, z) => [r * Math.cos(th), r * Math.sin(th), z],
  sph: (rho, th, ph) => [rho * Math.sin(ph) * Math.cos(th), rho * Math.sin(ph) * Math.sin(th), rho * Math.cos(ph)],
};
const D = (deg) => (deg * Math.PI) / 180;
export function ranges(s) {
  const dth = D(30 * s.size * 2);
  if (s.mode === 'cyl') return { lo: [s.a, D(s.b), s.c / 40], hi: [s.a + s.size, D(s.b) + dth, s.c / 40 + s.size] };
  return { lo: [s.a, D(s.b), D(s.c)], hi: [s.a + s.size, D(s.b) + dth, D(s.c) + D(30 * s.size * 2)] };
}
export function volumes(s) {
  const { lo, hi } = ranges(s);
  const d = [0, 1, 2].map((i) => hi[i] - lo[i]);
  if (s.mode === 'cyl') return { exact: 0.5 * (hi[0] ** 2 - lo[0] ** 2) * d[1] * d[2], approx: (lo[0] + d[0] / 2) * d[0] * d[1] * d[2], naive: d[0] * d[1] * d[2] };
  return { exact: ((hi[0] ** 3 - lo[0] ** 3) / 3) * (Math.cos(lo[2]) - Math.cos(hi[2])) * d[1], approx: (lo[0] + d[0] / 2) ** 2 * Math.sin(lo[2] + d[2] / 2) * d[0] * d[1] * d[2], naive: d[0] * d[1] * d[2] };
}
function boxFaces(map, lo, hi, c, n = 6) {
  const faces = [];
  const at = (u, v, w) => map(lo[0] + (hi[0] - lo[0]) * u, lo[1] + (hi[1] - lo[1]) * v, lo[2] + (hi[2] - lo[2]) * w);
  const side = (fixed, val) => {
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const p = (a, b) => { const t = [0, 0, 0]; const free = [0, 1, 2].filter((k) => k !== fixed); t[fixed] = val; t[free[0]] = a / n; t[free[1]] = b / n; return at(...t); };
      faces.push({ pts: [p(i, j), p(i + 1, j), p(i + 1, j + 1), p(i, j + 1)], fill: fixed === 0 ? c.fillA : fixed === 1 ? c.fillB : c.fillC, stroke: c.ink, width: 1 });
    }
  };
  [0, 1].forEach((v) => [0, 1, 2].forEach((f) => side(f, v)));
  return faces;
}

const tool = createTool({
  state,
  label: 'One small curved box cut out by changing each coordinate a little, drawn in cylindrical or spherical coordinates. Its sides are curved, and the sides that follow arcs are longer for bigger radius, which is where the extra factors in the volume element come from.',
  setup: (stage, c) => createCamera(stage, { extent: 4.2, yaw: 0.9, pitch: 0.5, c }),
  draw(ctx, stage, c, cam) {
    cam.axes({ size: 3.4 });
    const { lo, hi } = ranges(state);
    cam.faces(boxFaces(MAPS[state.mode], lo, hi, c));
  },
  controls: [
    { title: 'Cut out a box' },
    { key: 'mode', label: 'Coordinates', options: [['cyl', 'Cylindrical (r, θ, z)'], ['sph', 'Spherical (ρ, θ, φ)']] },
    { key: 'a', label: 'Distance r or ρ', min: 0.5, max: 3.5, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'b', label: 'Angle θ', min: 0, max: 330, step: 5, format: (v) => `${v}°` },
    { key: 'c', label: 'Height z (÷40 m) or angle φ', min: 10, max: 120, step: 5 },
    { key: 'size', label: 'Box size', min: 0.2, max: 1, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Δ-product (no extra factor)', () => volumes(state).naive.toFixed(4)],
      ['With the factor', () => volumes(state).approx.toFixed(4)],
      ['Exact volume of the box', () => volumes(state).exact.toFixed(4)],
    ] },
  ],
  tex: (s) => (s.mode === 'cyl' ? 'dV=r\\,dr\\,d\\theta\\,dz' : 'dV=\\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi'),
});
tool.extra.orbit(tool.update);
