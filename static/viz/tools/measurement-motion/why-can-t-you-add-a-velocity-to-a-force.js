import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { QUANTITIES, dimText, dimTex, canAdd, mul } from './_dimensions-math.js';

const PICK = ['length', 'time', 'speed', 'acceleration', 'force', 'energy', 'work'].map((id) => QUANTITIES.find((q) => q.id === id));
const state = { a: 2, b: 4, op: 'add' };
const A = (s) => PICK[s.a];
const B = (s) => PICK[s.b];

const tool = createTool({
  state,
  label: 'Two boxes holding the dimensions of the two chosen quantities, with a sign between them. If you add and the dimensions differ, the sum is crossed out. If they match, or you multiply, the result is allowed and its dimension is shown.',
  draw(ctx, stage, c) {
    const a = A(state);
    const b = B(state);
    const w = stage.w * 0.34;
    const h = stage.h * 0.3;
    const y = stage.h * 0.16;
    const sign = state.op === 'add' ? '+' : '×';
    [[stage.w * 0.06, a, c.fillB], [stage.w * 0.6, b, c.fillA]].forEach(([x, q, fill]) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
      label(ctx, q.name, x + w / 2, y + h * 0.28, c, { color: c.ink, size: 13, patch: false });
      label(ctx, q.unit, x + w / 2, y + h * 0.55, c, { color: c.ink, size: 13, patch: false });
      label(ctx, dimText(q.dim), x + w / 2, y + h * 0.82, c, { color: c.ink, size: 12, patch: false });
    });
    label(ctx, sign, stage.w / 2, y + h / 2, c, { color: c.ink, size: 30, patch: false });
    const ok = state.op === 'mul' || canAdd(a.dim, b.dim);
    const ry = stage.h * 0.62;
    ctx.fillStyle = ok ? c.fillC : c.fillA;
    ctx.fillRect(stage.w * 0.1, ry, stage.w * 0.8, stage.h * 0.28);
    ctx.strokeStyle = c.ink;
    ctx.strokeRect(stage.w * 0.1, ry, stage.w * 0.8, stage.h * 0.28);
    if (ok) {
      const dim = state.op === 'mul' ? mul(a.dim, b.dim) : a.dim;
      label(ctx, state.op === 'mul' ? `${a.unit} × ${b.unit}  has dimension` : `a ${a.name} + a ${b.name} is a ${a.name}`, stage.w / 2, ry + stage.h * 0.09, c, { color: c.ink, size: 12, patch: false, bounds: stage });
      label(ctx, dimText(dim), stage.w / 2, ry + stage.h * 0.19, c, { color: c.ink, size: 15, patch: false });
    } else {
      label(ctx, `${a.unit} + ${b.unit} = ?`, stage.w / 2, ry + stage.h * 0.09, c, { color: c.ink, size: 14, patch: false, bounds: stage });
      label(ctx, 'meaningless: the dimensions differ', stage.w / 2, ry + stage.h * 0.19, c, { color: c.ink, size: 13, patch: false, bounds: stage });
    }
  },
  controls: () => [
    { title: 'Try combining two quantities' },
    { key: 'a', label: 'First quantity', min: 0, max: PICK.length - 1, step: 1, format: (n) => PICK[n].name },
    { key: 'b', label: 'Second quantity', min: 0, max: PICK.length - 1, step: 1, format: (n) => PICK[n].name },
    { key: 'op', label: 'Operation', options: [['add', 'Add (+)'], ['mul', 'Multiply (×)']] },
    { readout: [
      ['First', (s) => dimText(A(s).dim)],
      ['Second', (s) => dimText(B(s).dim)],
      ['Allowed?', (s) => (s.op === 'mul' || canAdd(A(s).dim, B(s).dim) ? { text: 'yes', good: true } : { text: 'no: unlike dimensions', good: false })],
    ] },
  ],
  tex: (s) => `${dimTex(A(s).dim)}\\ ${s.op === 'add' ? '+' : '\\times'}\\ ${dimTex(B(s).dim)}`,
});
tool.update();
