import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { FIELDS3, sphereFlux, sphereVolume, dot, TAU } from './_vector-calculus-math.js';

const zero = (v) => (Math.abs(v) < 5e-3 ? 0 : v);
const state = { field: 'source', R: 2, cx: 0 };
const centre = (s) => [s.cx, 0, 0];
const flux = (s) => sphereFlux(FIELDS3[s.field].F, centre(s), s.R, 48);
// ∭ div F dV for these three fields: div is constant (3, 0) or 2x (linear), so the average over the ball is div at the centre.
const sources = (s) => FIELDS3[s.field].div(...centre(s)) * sphereVolume(s.R);

const tool = createTool({
  state,
  label: 'A closed sphere in a flow. Arrows at points on the sphere are green where they leave and blue where they enter. The total outflow equals the total of the sources inside.',
  setup: (stage, c) => createCamera(stage, { extent: 6.2, yaw: 0.75, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const { F } = FIELDS3[state.field];
    const [cx] = centre(state);
    cam.axes({ size: 5 });
    // Wire sphere.
    const R = state.R;
    const ring = (f) => {
      let last = f(0);
      for (let i = 1; i <= 48; i++) { const p = f(i / 48); cam.line(last, p, { color: c.grid, width: 1.5 }); last = p; }
    };
    for (let a = 0; a < 180; a += 30) ring((u) => [cx + R * Math.sin(u * TAU) * Math.cos((a * Math.PI) / 180), R * Math.sin(u * TAU) * Math.sin((a * Math.PI) / 180), R * Math.cos(u * TAU)]);
    ring((u) => [cx + R * Math.cos(u * TAU), R * Math.sin(u * TAU), 0]);
    // Arrows on the surface.
    for (let i = 1; i <= 5; i++) for (let j = 0; j < 8; j++) {
      const phi = (i / 6) * Math.PI;
      const th = (j / 8) * TAU + 0.2;
      const n = [Math.sin(phi) * Math.cos(th), Math.sin(phi) * Math.sin(th), Math.cos(phi)];
      const p = [cx + R * n[0], R * n[1], R * n[2]];
      const f = F(...p);
      const out = dot(f, n);
      const k = 0.35;
      cam.arrow(p, p.map((v, d) => v + f[d] * k), { color: out >= 0 ? c.c : c.b, width: 3 });
    }
  },
  controls: [
    { title: 'A sphere in a flow' },
    { key: 'field', label: 'Flow', options: Object.entries(FIELDS3).map(([k, v]) => [k, v.name]) },
    { key: 'R', label: 'Sphere radius', min: 1, max: 3, step: 0.5 },
    { key: 'cx', label: 'Sphere centre x', min: -2, max: 2, step: 1 },
    { readout: [
      ['Outflow through the sphere', (s) => fixed(zero(flux(s)), 2)],
      ['Sources inside ∭ div F dV', (s) => fixed(zero(sources(s)), 2)],
      ['div F at the centre', (s) => fixed(zero(FIELDS3[s.field].div(...centre(s))), 2)],
    ] },
  ],
  tex: (s) => `\\oint_S \\mathbf{F}\\cdot\\mathbf{n}\\,dS = \\iiint_V \\nabla\\cdot\\mathbf{F}\\,dV`,
});
tool.extra.orbit(tool.update);
