import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { cross, norm, triple } from './_cross-product-math.js';

// a lies along x and b in the floor, so the base parallelogram is flat and the height is c's z.
const state = { ax: 3, bx: 1, by: 2, cx: 1, cy: 1, cz: 3 };
const O = [0, 0, 0];
const A = (s) => [s.ax, 0, 0];
const B = (s) => [s.bx, s.by, 0];
const C = (s) => [s.cx, s.cy, s.cz];
const plus = (...vs) => vs[0].map((_, i) => vs.reduce((t, v) => t + v[i], 0));

const tool = createTool({
  state,
  label: 'A box on three vectors a, b and c. The floor parallelogram is the base, and the height of the top above the floor is dashed.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.65, pitch: 0.45, c }),
  draw(ctx, stage, c, cam) {
    const [a, b, v] = [A(state), B(state), C(state)];
    cam.axes({ size: 6 });
    const P = (...p) => plus(...p);
    const top = (x) => plus(x, v);
    cam.faces([
      { pts: [O, a, P(a, b), b], fill: c.fillY, stroke: c.ink, width: 3 },
      { pts: [O, a, top(a), v], fill: c.fillB, stroke: c.grid },
      { pts: [O, b, top(b), v], fill: c.fillC, stroke: c.grid },
      { pts: [a, P(a, b), top(P(a, b)), top(a)], fill: c.fillC, stroke: c.grid },
      { pts: [b, P(a, b), top(P(a, b)), top(b)], fill: c.fillB, stroke: c.grid },
      { pts: [v, top(a), top(P(a, b)), top(b)], fill: c.fillA, stroke: c.grid },
    ]);
    cam.line(v, [v[0], v[1], 0], { color: c.c, width: 4, dash: [6, 4] });
    cam.arrow(O, a, { color: c.a, width: 4 });
    cam.arrow(O, b, { color: c.b, width: 4 });
    cam.arrow(O, v, { color: c.d, width: 4 });
    cam.label('a', a.map((x) => x * 1.1 + 0.2), { size: 13, color: c.a });
    cam.label('b', b.map((x) => x * 1.1 + 0.2), { size: 13, color: c.b });
    cam.label('c', v.map((x) => x * 1.05), { size: 13, color: c.d });
  },
  controls: [
    { title: 'Three vectors, a box' },
    { key: 'ax', label: 'a: along x', min: 1, max: 5, step: 1 },
    { key: 'bx', label: 'b: x', min: -3, max: 3, step: 1 },
    { key: 'by', label: 'b: y', min: 1, max: 4, step: 1 },
    { key: 'cx', label: 'c: x', min: -3, max: 3, step: 1 },
    { key: 'cy', label: 'c: y', min: -3, max: 3, step: 1 },
    { key: 'cz', label: 'c: z (height)', min: -4, max: 4, step: 1 },
    { readout: [
      ['Base |a × b|', (s) => fixed(norm(cross(A(s), B(s))), 3)],
      ['Height |c_z|', (s) => String(Math.abs(s.cz))],
      ['Base × height', (s) => fixed(norm(cross(A(s), B(s))) * Math.abs(s.cz), 3)],
      ['a · (b × c)', (s) => String(triple(A(s), B(s), C(s)))],
    ] },
  ],
  tex: (s) => `V = |\\mathbf{a}\\times\\mathbf{b}|\\times h = ${fixed(norm(cross(A(s), B(s))), 2)}\\times ${Math.abs(s.cz)} = ${fixed(norm(cross(A(s), B(s))) * Math.abs(s.cz), 2)}`,
});
tool.extra.orbit(tool.update);
