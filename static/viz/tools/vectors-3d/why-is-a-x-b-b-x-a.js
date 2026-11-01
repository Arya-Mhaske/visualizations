import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { cross, norm, neg } from './_cross-product-math.js';

const state = { order: 'ab', theta: 70 };
const first = [4, 0, 0];
const second = (s) => [3 * Math.cos((s.theta * Math.PI) / 180), 3 * Math.sin((s.theta * Math.PI) / 180), 0];
const O = [0, 0, 0];

// Arc from vector p to vector q in the floor, with an arrow head: the way the fingers curl.
function curl(cam, c, p, q, radius, color) {
  const [a0, a1] = [Math.atan2(p[1], p[0]), Math.atan2(q[1], q[0])];
  let delta = a1 - a0;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  let last = [radius * Math.cos(a0), radius * Math.sin(a0), 0];
  for (let i = 1; i <= 20; i++) {
    const t = a0 + (delta * i) / 20;
    const next = [radius * Math.cos(t), radius * Math.sin(t), 0];
    if (i === 20) cam.arrow(last, next, { color, width: 3 });
    else cam.line(last, next, { color, width: 3 });
    last = next;
  }
}

const tool = createTool({
  state,
  label: 'Two vectors on the floor. A curved arrow shows the turn from the first named vector to the second, and the cross product points up or down depending on the order.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.6, pitch: 0.55, c }),
  draw(ctx, stage, c, cam) {
    const a = first;
    const b = second(state);
    const [p, q] = state.order === 'ab' ? [a, b] : [b, a];
    const n = cross(p, q);
    cam.axes({ size: 5.5 });
    cam.faces([{ pts: [O, a, a.map((v, i) => v + b[i]), b], fill: c.fillY, stroke: c.grid }]);
    cam.arrow(O, a, { color: c.a, width: 4 });
    cam.arrow(O, b, { color: c.b, width: 4 });
    cam.label('a', a.map((v) => v * 1.1), { size: 13, color: c.a });
    cam.label('b', b.map((v) => v * 1.1), { size: 13, color: c.b });
    curl(cam, c, p, q, 1.6, c.ink);
    const tip = [0, 0, Math.sign(n[2]) * 3];
    cam.line(O, neg(tip), { color: c.grid, width: 2, dash: [5, 4] });
    if (n[2] !== 0) {
      cam.arrow(O, tip, { color: c.c, width: 6 });
      cam.label(state.order === 'ab' ? 'a × b' : 'b × a', [0, 0, tip[2] + Math.sign(tip[2]) * 0.7], { size: 12, color: c.c });
    }
  },
  controls: [
    { title: 'Which vector comes first?' },
    { key: 'order', label: 'Cross product', options: [['ab', 'a × b'], ['ba', 'b × a']] },
    { key: 'theta', label: 'Angle θ from a to b', min: 10, max: 170, step: 5, format: (v) => `${v}°` },
    { readout: [
      ['Fingers curl from', (s) => (s.order === 'ab' ? 'a to b' : 'b to a')],
      ['z-part of result', (s) => { const [p, q] = s.order === 'ab' ? [first, second(s)] : [second(s), first]; return fixed(cross(p, q)[2], 3); }],
      ['Length', (s) => fixed(norm(cross(first, second(s))), 3)],
    ] },
  ],
  tex: (s) => `|\\mathbf{a}\\times\\mathbf{b}| = |\\mathbf{b}\\times\\mathbf{a}| = ${fixed(norm(cross(first, second(s))), 3)},\\quad \\mathbf{a}\\times\\mathbf{b} = -\\,\\mathbf{b}\\times\\mathbf{a}`,
});
tool.extra.orbit(tool.update);
