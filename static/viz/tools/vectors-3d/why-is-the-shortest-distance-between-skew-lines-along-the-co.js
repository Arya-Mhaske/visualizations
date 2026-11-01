import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { closest, skewDistance, cross, dot, norm, sub, scale, add } from './_lines-planes-math.js';

// Line 1: a + s u (on the floor). Line 2: b + t v (above, at an angle). The student moves the foot on each line.
const a = [-4, -1, 0];
const u = [1, 0.3, 0];
const b = [1, -4, 2];
const v = [0, 1, 0.2];
const best = closest(a, u, b, v);
const state = { s: 0, t: 0 };
const ends = (s) => [add(a, scale(u, s.s)), add(b, scale(v, s.t))];
const len = (s) => { const [p, q] = ends(s); return norm(sub(p, q)); };
const nrm = cross(u, v);
// Cosine of the angle between the segment and each line: 0 means square to it.
const cosWith = (s, d) => { const [p, q] = ends(s); const w = sub(q, p); return norm(w) === 0 ? 0 : dot(w, d) / (norm(w) * norm(d)); };

state.s = Math.round(best.s * 2) / 2 - 2;
state.t = Math.round(best.t * 2) / 2 + 2;

const tool = createTool({
  state,
  label: 'Two skew lines. A segment joins a point on each. The segment is shortest, and square to both lines, at one pair of points, marked with a ring.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.7, pitch: 0.45, c }),
  draw(ctx, stage, c, cam) {
    const [p, q] = ends(state);
    cam.axes({ size: 5 });
    cam.line(add(a, scale(u, -6)), add(a, scale(u, 8)), { color: c.a, width: 4 });
    cam.line(add(b, scale(v, -8)), add(b, scale(v, 8)), { color: c.b, width: 4 });
    cam.line(best.p, best.q, { color: c.c, width: 2, dash: [5, 4] });
    cam.point(best.p, { fill: c.c, r: 4 });
    cam.point(best.q, { fill: c.c, r: 4 });
    cam.line(p, q, { color: c.d, width: 5 });
    cam.point(p, { fill: c.a, r: 7 });
    cam.point(q, { fill: c.b, r: 7 });
  },
  controls: [
    { title: 'Slide the two ends of the segment' },
    { key: 's', label: 'Foot on line 1 (s)', min: -8, max: 8, step: 0.25 },
    { key: 't', label: 'Foot on line 2 (t)', min: -8, max: 8, step: 0.25 },
    { readout: [
      ['Segment length', (s) => fixed(len(s), 3)],
      ['cos with line 1', (s) => fixed(cosWith(s, u), 3)],
      ['cos with line 2', (s) => fixed(cosWith(s, v), 3)],
      ['Shortest possible', () => fixed(best.dist, 3)],
      ['Formula |(b − a)·(u × v)| / |u × v|', () => fixed(skewDistance(a, u, b, v), 3)],
    ] },
  ],
  tex: () => `d = \\dfrac{|(\\mathbf{b}-\\mathbf{a})\\cdot(\\mathbf{u}\\times\\mathbf{v})|}{|\\mathbf{u}\\times\\mathbf{v}|} = \\dfrac{${fixed(Math.abs(dot(sub(b, a), nrm)), 3)}}{${fixed(norm(nrm), 3)}} = ${fixed(skewDistance(a, u, b, v), 3)}`,
});
tool.extra.orbit(tool.update);
