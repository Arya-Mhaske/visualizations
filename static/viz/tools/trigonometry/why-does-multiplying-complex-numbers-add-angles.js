import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arc, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, drawGrid, eqFrame, polarHandle, rad } from './_kit.js';
import { cmul, toRect } from './_polar-math.js';

const state = { z: { r: 2, th: 30 }, w: { r: 1.5, th: 50 } };
let f = null;
const rect = (p) => toRect(p.r, p.th);
const prod = () => ({ r: state.z.r * state.w.r, th: (state.z.th + state.w.th) % 360 });
const cp = (z) => `${fixed(z[0], 2)} ${z[1] < 0 ? '−' : '+'} ${fixed(Math.abs(z[1]), 2)}i`;

const tool = createTool({
  state,
  label: 'Two complex numbers z and w as arrows from the origin, and their product zw as a green arrow. The angle of the green arrow is the angle of z plus the angle of w, drawn as two arcs placed end to end. Its length is the product of the two lengths.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-9.5, 9.5], [-9.5, 9.5], 8);
    drawGrid(ctx, f, c, stage, { step: 1, labels: false });
    const O = f.px([0, 0]);
    const p = prod();
    const a1 = rad(state.z.th);
    const a2 = rad(state.z.th + state.w.th);
    arc(ctx, ...O, 36, 0, -a1, { color: c.a, width: 4 });
    arc(ctx, ...O, 46, -a1, -a2, { color: c.b, width: 4 });
    arc(ctx, ...O, p.r * f.k, 0, 0.0001, { color: c.grid, width: 1 });
    arrowW(ctx, f, [0, 0], rect(p), { color: c.c, width: 7, head: 13 });
    arrowW(ctx, f, [0, 0], rect(state.z), { color: c.a, width: 4, head: 11 });
    arrowW(ctx, f, [0, 0], rect(state.w), { color: c.b, width: 4, head: 11 });
    [[rect(state.z), 'z', c.a], [rect(state.w), 'w', c.b], [rect(p), 'zw', c.c]].forEach(([q, t, col]) => {
      dot(ctx, ...f.px(q), 8, col, c.ink);
      label(ctx, t, f.px(q)[0] + 10, f.px(q)[1] - 12, c, { size: 12, color: col, bounds: stage, patch: false });
    });
  },
  controls: [
    { title: 'Drag z and w' },
    { readout: [
      ['z', () => `${fixed(state.z.r, 1)} ∠ ${state.z.th}°`],
      ['w', () => `${fixed(state.w.r, 1)} ∠ ${state.w.th}°`],
      ['Lengths multiply', () => `${fixed(state.z.r, 1)} × ${fixed(state.w.r, 1)} = ${fixed(prod().r, 2)}`],
      ['Angles add', () => `${state.z.th}° + ${state.w.th}° = ${state.z.th + state.w.th}°`],
      ['zw by multiplying out', () => cp(cmul(rect(state.z), rect(state.w)))],
      ['zw from length and angle', () => cp(rect(prod()))],
    ] },
  ],
  tex: () => `(r_1\\angle\\theta_1)(r_2\\angle\\theta_2)=r_1r_2\\angle(\\theta_1+\\theta_2)=${fixed(prod().r, 2)}\\angle ${state.z.th + state.w.th}^\\circ`,
});

handles(tool.stage, [
  polarHandle(() => f, () => state.z, (p) => { state.z = p; }, { rMin: 0.5, rMax: 3 }),
  polarHandle(() => f, () => state.w, (p) => { state.w = p; }, { rMin: 0.5, rMax: 3 }),
], { onChange: () => tool.update(), radius: 34 });
