import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { anglesOf, rad, sidesOf } from './_triangle-math.js';
import { angleArc, eqFrame, pointHandle } from './_kit.js';

const state = { A: [1, 1], B: [9, 1.5], C: [6, 6] };
const W = [-0.5, 10.5];
const H = [-0.5, 7.5];
let f = null;
const frameOf = () => f;
const sinD = (d) => Math.sin(rad(d));
const info = () => { const s = sidesOf(state.A, state.B, state.C); return { ...s, ...anglesOf(s) }; };
const clamp = ([x, y]) => [Math.max(0, Math.min(10, x)), Math.max(0, Math.min(7, y))];
const foot = () => {
  const [ax, ay] = state.A; const [bx, by] = state.B; const [cx, cy] = state.C;
  const t = ((cx - ax) * (bx - ax) + (cy - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2);
  return [ax + t * (bx - ax), ay + t * (by - ay)];
};

const tool = createTool({
  state,
  label: 'A triangle ABC you can reshape by dragging its corners. A perpendicular from C to the line AB is drawn. The same height h is worked out two ways: b sin A in the triangle on the left, and a sin B in the triangle on the right.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, W, H);
    const [A, B, C] = [state.A, state.B, state.C].map(f.px);
    const F = f.px(foot());
    poly(ctx, [A, F, C], { fill: c.fillB, stroke: c.ink, width: 2 });
    poly(ctx, [B, F, C], { fill: c.fillA, stroke: c.ink, width: 2 });
    poly(ctx, [A, B, C], { fill: null, stroke: c.ink, width: 3 });
    line(ctx, ...C, ...F, { color: c.d, width: 5 });
      angleArc(ctx, A, B, C, 28, { color: c.b, width: 3 });
    angleArc(ctx, B, A, C, 28, { color: c.a, width: 3 });
    [[A, 'A', c.b], [B, 'B', c.a], [C, 'C', c.ink]].forEach(([p, text, col]) => {
      dot(ctx, ...p, 9, col, c.ink);
      label(ctx, text, p[0], p[1] + (p === C ? -16 : 18), c, { size: 13, bounds: stage, patch: false });
    });
    label(ctx, 'h', (C[0] + F[0]) / 2 + 10, (C[1] + F[1]) / 2, c, { size: 12, color: c.d, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Drag A, B or C' },
    { readout: [
      ['Height h from the figure', () => fixed(Math.hypot(...[0, 1].map((k) => state.C[k] - foot()[k])), 3)],
      ['h = b sin A', () => fixed(info().b * sinD(info().A), 3)],
      ['h = a sin B', () => fixed(info().a * sinD(info().B), 3)],
      ['a ÷ sin A', () => fixed(info().a / sinD(info().A), 3)],
      ['b ÷ sin B', () => fixed(info().b / sinD(info().B), 3)],
      ['c ÷ sin C', () => fixed(info().c / sinD(info().C), 3)],
    ] },
  ],
  tex: () => `b\\sin A=a\\sin B\\ \\Rightarrow\\ \\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}=${fixed(info().a / sinD(info().A), 2)}`,
});

handles(tool.stage, ['A', 'B', 'C'].map((k) => pointHandle(frameOf, () => state[k], (p) => { state[k] = clamp(p); }, { limit: clamp })), { onChange: () => tool.update(), radius: 30 });
