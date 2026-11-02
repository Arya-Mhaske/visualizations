import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { anglesOf, areaBaseHeight, areaSAS, heron, sidesOf } from './_triangle-math.js';
import { angleArc, drawGrid, eqFrame, pointHandle } from './_kit.js';

const state = { A: [1, 1], B: [8, 2], C: [4, 6] };
let f = null;
const clamp = ([x, y]) => [Math.max(0, Math.min(10, Math.round(x * 2) / 2)), Math.max(0, Math.min(8, Math.round(y * 2) / 2))];
const info = () => {
  const s = sidesOf(state.A, state.B, state.C);
  const t = anglesOf(s);
  return { ...s, ...t, byBase: areaBaseHeight(state.A, state.B, state.C), bySin: areaSAS(s.a, s.b, t.C), byHeron: heron(s.a, s.b, s.c) };
};

const tool = createTool({
  state,
  label: 'A triangle on a grid whose corners you can drag. Three areas are computed live from the corners: half base times height, half a b sin C, and Heron’s formula from the three sides. All three read the same.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-0.7, 10.7], [-0.7, 8.7], 8);
    drawGrid(ctx, f, c, stage, { step: 1, labels: false });
    const [A, B, C] = [state.A, state.B, state.C].map(f.px);
    poly(ctx, [A, B, C], { fill: c.fillC, stroke: c.ink, width: 3 });
    angleArc(ctx, C, A, B, 26, { color: c.a, width: 4 });
    // height from C onto AB
    const [ax, ay] = state.A; const [bx, by] = state.B; const [cx, cy] = state.C;
    const t = ((cx - ax) * (bx - ax) + (cy - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2);
    const F = f.px([ax + t * (bx - ax), ay + t * (by - ay)]);
    line(ctx, ...C, ...F, { color: c.d, width: 3, dash: [7, 5] });
    [[A, 'A', c.b], [B, 'B', c.b], [C, 'C', c.a]].forEach(([p, text, col]) => {
      dot(ctx, ...p, 9, col, c.ink);
      label(ctx, text, p[0], p[1] + (text === 'C' ? -16 : 18), c, { size: 13, bounds: stage, patch: false });
    });
  },
  controls: [
    { title: 'Drag A, B or C' },
    { readout: [
      ['Sides a, b, c', () => `${fixed(info().a, 2)}, ${fixed(info().b, 2)}, ${fixed(info().c, 2)}`],
      ['½ × base × height', () => fixed(info().byBase, 3)],
      ['½ab sin C', () => fixed(info().bySin, 3)],
      ['Heron: √(s(s−a)(s−b)(s−c))', () => fixed(info().byHeron, 3)],
      ['Biggest gap between them', () => { const i = info(); return fixed(Math.max(i.byBase, i.bySin, i.byHeron) - Math.min(i.byBase, i.bySin, i.byHeron), 6); }],
    ] },
  ],
  tex: () => `\\tfrac12 bh=${fixed(info().byBase, 2)},\\ \\tfrac12 ab\\sin C=${fixed(info().bySin, 2)},\\ \\sqrt{s(s-a)(s-b)(s-c)}=${fixed(info().byHeron, 2)}`,
});

handles(tool.stage, ['A', 'B', 'C'].map((k) => pointHandle(() => f, () => state[k], (p) => { state[k] = clamp(p); }, { limit: clamp, unit: 0.5 })), { onChange: () => tool.update(), radius: 30 });
