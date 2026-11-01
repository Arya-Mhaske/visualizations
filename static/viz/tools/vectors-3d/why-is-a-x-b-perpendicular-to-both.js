import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { cross, dot, norm, spinZ } from './_cross-product-math.js';

const state = { ax: 3, ay: 0, az: 1, bx: 1, by: 2, bz: 0, spin: 0 };
const O = [0, 0, 0];
const rad = (s) => (s.spin * Math.PI) / 180;
const pair = (s) => [spinZ([s.ax, s.ay, s.az], rad(s)), spinZ([s.bx, s.by, s.bz], rad(s))];
const AX = (s) => [s.ax, s.ay, s.az];
const BX = (s) => [s.bx, s.by, s.bz];
const zero = (v) => (Math.abs(v) < 1e-9 ? 0 : v);

const tool = createTool({
  state,
  label: 'Two vectors a and b with the parallelogram they span, and the arrow a × b standing straight up from that parallelogram. Spinning the pair spins the arrow with it.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const [a, b] = pair(state);
    const n = cross(a, b);
    cam.axes({ size: 6 });
    cam.faces([{ pts: [O, a, a.map((v, i) => v + b[i]), b], fill: c.fillY, stroke: c.grid }]);
    cam.arrow(O, a, { color: c.a, width: 4 });
    cam.arrow(O, b, { color: c.b, width: 4 });
    cam.label('a', a.map((v) => v * 1.1), { size: 13, color: c.a });
    cam.label('b', b.map((v) => v * 1.1), { size: 13, color: c.b });
    if (norm(n) > 1e-9) {
      const tip = n.map((v) => (v * 4) / Math.max(norm(n), 4));
      cam.arrow(O, tip, { color: c.c, width: 6 });
      cam.label('a × b', tip.map((v) => v * 1.12), { size: 12, color: c.c });
    }
  },
  controls: [
    { title: 'Two vectors, and a turn for the pair' },
    { key: 'spin', label: 'Spin the pair', min: 0, max: 360, step: 5, format: (v) => `${v}°` },
    { key: 'ax', label: 'a: x', min: -4, max: 4, step: 1 },
    { key: 'ay', label: 'a: y', min: -4, max: 4, step: 1 },
    { key: 'az', label: 'a: z', min: -4, max: 4, step: 1 },
    { key: 'bx', label: 'b: x', min: -4, max: 4, step: 1 },
    { key: 'by', label: 'b: y', min: -4, max: 4, step: 1 },
    { key: 'bz', label: 'b: z', min: -4, max: 4, step: 1 },
    { readout: [
      ['a × b', (s) => { const [a, b] = pair(s); return `(${cross(a, b).map((v) => fixed(zero(v), 2)).join(', ')})`; }],
      ['a · (a × b)', (s) => { const [a, b] = pair(s); return fixed(zero(dot(a, cross(a, b))), 3); }],
      ['b · (a × b)', (s) => { const [a, b] = pair(s); return fixed(zero(dot(b, cross(a, b))), 3); }],
    ] },
  ],
  tex: (s) => {
    const n = cross(AX(s), BX(s)).map(zero);
    return `\\mathbf{a}\\times\\mathbf{b} = \\begin{pmatrix}${n.join('\\\\')}\\end{pmatrix},\\quad \\mathbf{a}\\cdot(\\mathbf{a}\\times\\mathbf{b}) = ${dot(AX(s), n)}`;
  },
});
tool.extra.orbit(tool.update);
