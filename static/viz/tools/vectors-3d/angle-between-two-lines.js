import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { dot, norm, lineAngle, scale } from './_lines-planes-math.js';

const state = { a1: 2, b1: 1, c1: 2, a2: -1, b2: 2, c2: 2 };
const U = (s) => [s.a1, s.b1, s.c1];
const V = (s) => [s.a2, s.b2, s.c2];
const O = [0, 0, 0];

const tool = createTool({
  state,
  label: 'Two lines through the origin, one coral and one blue, with the angle between them marked by an arc.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const [u, v] = [U(state), V(state)];
    cam.axes({ size: 6 });
    if (norm(u) === 0 || norm(v) === 0) return;
    const [hu, hv] = [scale(u, 1 / norm(u)), scale(v, 1 / norm(v))];
    cam.line(scale(hu, -6), scale(hu, 6), { color: c.a, width: 4 });
    cam.line(scale(hv, -6), scale(hv, 6), { color: c.b, width: 4 });
    // An arc in the plane of the two lines, between the unit directions (the acute angle of the pair).
    const sign = dot(hu, hv) < 0 ? -1 : 1;
    const w = scale(hv, sign);
    const theta = Math.acos(Math.max(-1, Math.min(1, dot(hu, w))));
    if (Math.sin(theta) > 1e-6) {
      let last = scale(hu, 2.5);
      for (let i = 1; i <= 16; i++) {
        const t = (i / 16) * theta;
        const [w0, w1] = [Math.sin(theta - t) / Math.sin(theta), Math.sin(t) / Math.sin(theta)];
        const p = hu.map((x, k) => 2.5 * (w0 * x + w1 * w[k]));
        cam.line(last, p, { color: c.ink, width: 3 });
        last = p;
      }
    }
    cam.point(O, { fill: c.ink, r: 5 });
  },
  controls: [
    { title: 'Direction ratios of line 1 (coral)' },
    { key: 'a1', label: 'a₁', min: -4, max: 4, step: 1 },
    { key: 'b1', label: 'b₁', min: -4, max: 4, step: 1 },
    { key: 'c1', label: 'c₁', min: -4, max: 4, step: 1 },
    { title: 'Direction ratios of line 2 (blue)' },
    { key: 'a2', label: 'a₂', min: -4, max: 4, step: 1 },
    { key: 'b2', label: 'b₂', min: -4, max: 4, step: 1 },
    { key: 'c2', label: 'c₂', min: -4, max: 4, step: 1 },
    { readout: [
      ['Top: |a₁a₂ + b₁b₂ + c₁c₂|', (s) => String(Math.abs(dot(U(s), V(s))))],
      ['Bottom', (s) => fixed(norm(U(s)) * norm(V(s)), 3)],
      ['θ', (s) => (norm(U(s)) * norm(V(s)) === 0 ? '–' : `${fixed(lineAngle(U(s), V(s)), 2)}°`)],
    ] },
  ],
  tex: (s) => {
    const [u, v] = [U(s), V(s)];
    if (norm(u) * norm(v) === 0) return '\\text{A direction of (0, 0, 0) is not a line.}';
    return `\\cos\\theta = \\dfrac{|${dot(u, v)}|}{${fixed(norm(u), 3)}\\times${fixed(norm(v), 3)}} = ${fixed(Math.abs(dot(u, v)) / (norm(u) * norm(v)), 4)}`;
  },
});
tool.extra.orbit(tool.update);
