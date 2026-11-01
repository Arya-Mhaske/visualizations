import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { norm, scale, add } from './_lines-planes-math.js';

const state = { x1: 1, y1: 2, z1: 1, a: 2, b: 1, c: 3, lam: 1 };
const P1 = (s) => [s.x1, s.y1, s.z1];
const D = (s) => [s.a, s.b, s.c];
// Cartesian form: a zero direction ratio is written with a zero denominator, as "(y − y₁) = 0".
const frac = (letter, v, d) => `\\dfrac{${letter} - ${v}}{${d}}`;
const sg = (v) => (v < 0 ? `(${v})` : String(v));

const tool = createTool({
  state,
  label: 'A line through a point P1 with direction ratios a, b, c. A marker at the position λ along the line, with the arrow λb from P1.',
  setup: (stage, c) => createCamera(stage, { extent: 8, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const p = P1(state);
    const d = D(state);
    if (norm(d) === 0) return;
    const here = add(p, scale(d, state.lam));
    cam.axes({ size: 7 });
    cam.line(add(p, scale(d, -4)), add(p, scale(d, 4)), { color: c.grid, width: 3 });
    cam.arrow(p, add(p, d), { color: c.b, width: 4 });
    cam.line(p, here, { color: c.a, width: 6 });
    cam.point(p, { fill: c.ink, r: 6 });
    cam.point(here, { fill: c.a, r: 8 });
    cam.label('P₁', p.map((v) => v + 0.4), { size: 12 });
    cam.label('r', here.map((v) => v + 0.4), { size: 13, color: c.a });
  },
  controls: [
    { title: 'A point and a direction' },
    { key: 'x1', label: 'x₁', min: -4, max: 4, step: 1 },
    { key: 'y1', label: 'y₁', min: -4, max: 4, step: 1 },
    { key: 'z1', label: 'z₁', min: -4, max: 4, step: 1 },
    { key: 'a', label: 'a', min: -4, max: 4, step: 1 },
    { key: 'b', label: 'b', min: -4, max: 4, step: 1 },
    { key: 'c', label: 'c', min: -4, max: 4, step: 1 },
    { key: 'lam', label: 'λ (position)', min: -3, max: 3, step: 0.25 },
    { readout: [
      ['r = a + λb', (s) => `(${add(P1(s), scale(D(s), s.lam)).map((v) => fixed(v, 2)).join(', ')})`],
      ['Each fraction equals', (s) => fixed(s.lam, 2)],
    ] },
  ],
  tex: (s) => {
    if (norm(D(s)) === 0) return '\\text{A line needs a direction: a, b, c not all 0.}';
    const [p, d] = [P1(s), D(s)];
    const vec = `\\mathbf{r} = (${p.join(', ')}) + \\lambda(${d.join(', ')})`;
    if (d.every((v) => v !== 0)) return `${vec}\\quad ${frac('x', sg(p[0]), d[0])} = ${frac('y', sg(p[1]), d[1])} = ${frac('z', sg(p[2]), d[2])}`;
    return `${vec}\\quad x = ${p[0]} + ${sg(d[0])}\\lambda,\\ y = ${p[1]} + ${sg(d[1])}\\lambda,\\ z = ${p[2]} + ${sg(d[2])}\\lambda`;
  },
});
tool.extra.orbit(tool.update);
