import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { dot, norm, scalarProjection, vectorProjection, perpendicular } from './_vectors-in-space-math.js';

const state = { ax: 3, ay: 4, az: 2, bx: 5, by: 1, bz: 0 };
const O = [0, 0, 0];
const A = (s) => [s.ax, s.ay, s.az];
const B = (s) => [s.bx, s.by, s.bz];
const vec = (p) => `(${p.map((v) => fixed(v, 2)).join(', ')})`;

const tool = createTool({
  state,
  label: 'Two vectors a and b from the origin. The shadow of a on the line of b is drawn, with a dashed drop from the tip of a to it, at a right angle.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const a = A(state);
    const b = B(state);
    cam.axes({ size: 6 });
    if (norm(b) === 0) { cam.arrow(O, a, { color: c.a, width: 4 }); return; }
    const p = vectorProjection(a, b);
    const far = b.map((v) => v * (7 / norm(b)));
    const back = b.map((v) => -v * (3 / norm(b)));
    cam.line(back, far, { color: c.grid, width: 2, dash: [6, 4] });
    cam.line(a, p, { color: c.ink, width: 2, dash: [5, 4] });
    cam.arrow(O, p, { color: c.c, width: 6 });
    cam.arrow(O, b, { color: c.b, width: 4 });
    cam.arrow(O, a, { color: c.a, width: 4 });
    cam.point(p, { fill: c.c, r: 5 });
    cam.label('a', a.map((v) => v * 1.08), { size: 13, color: c.a });
    cam.label('b', b.map((v) => v * 1.08), { size: 13, color: c.b });
    cam.label('shadow', p.map((v) => v + 0.4), { size: 11, color: c.c });
  },
  controls: [
    { title: 'Vector a (coral) and vector b (blue)' },
    { key: 'ax', label: 'a: x', min: -5, max: 5, step: 1 },
    { key: 'ay', label: 'a: y', min: -5, max: 5, step: 1 },
    { key: 'az', label: 'a: z', min: -5, max: 5, step: 1 },
    { key: 'bx', label: 'b: x', min: -5, max: 5, step: 1 },
    { key: 'by', label: 'b: y', min: -5, max: 5, step: 1 },
    { key: 'bz', label: 'b: z', min: -5, max: 5, step: 1 },
    { readout: [
      ['a · b', (s) => String(dot(A(s), B(s)))],
      ['|b|', (s) => fixed(norm(B(s)), 3)],
      ['Shadow length', (s) => { const q = scalarProjection(A(s), B(s)); return q === null ? '–' : fixed(q, 3); }],
      ['Shadow vector', (s) => { const p = vectorProjection(A(s), B(s)); return p ? vec(p) : '–'; }],
      ['Drop · b', (s) => { const r = perpendicular(A(s), B(s)); return r ? fixed(dot(r, B(s)), 3) : '–'; }],
    ] },
  ],
  tex: (s) => {
    const a = A(s);
    const b = B(s);
    if (norm(b) === 0) return '\\text{b = 0 has no line to cast a shadow on.}';
    return `\\dfrac{\\mathbf{a}\\cdot\\mathbf{b}}{|\\mathbf{b}|} = \\dfrac{${dot(a, b)}}{${fixed(norm(b), 3)}} = ${fixed(dot(a, b) / norm(b), 3)}`;
  },
});
tool.extra.orbit(tool.update);
