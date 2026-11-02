import { createTool } from '../../lib/tool.js';
import { numberLine } from '../../lib/numline.js';
import { label } from '../../lib/draw.js';

const state = { a: -2, b: -3 };
const f = (v) => String(v).replace('-', '−');

createTool({
  state,
  label: 'A number line. Hops of size b are made |a| times from zero. If a is negative, the result is turned through a half-turn about zero. A table beside it lists the products as a counts down.',
  draw(ctx, stage, c) {
    const { a, b } = state;
    const nl = numberLine(ctx, stage, c, { lo: -18, hi: 18, y: stage.h * 0.32, step: 3 });
    nl.axis();
    const n = Math.abs(a);
    for (let i = 0; i < n; i++) nl.arrow(i * b, (i + 1) * b, { color: c.b, dy: -12 - (i % 2) * 10 });
    const land = n * b;
    nl.mark(land, { fill: c.b, r: 7 });
    if (a < 0) {
      const [x1, x2] = [nl.px(land), nl.px(-land)];
      if (x1 !== x2) {
        ctx.save();
        ctx.strokeStyle = c.a;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc((x1 + x2) / 2, stage.h * 0.32, Math.abs(x2 - x1) / 2, x1 < x2 ? Math.PI : 0, x1 < x2 ? 0 : Math.PI, x1 > x2);
        ctx.stroke();
        ctx.restore();
      }
      nl.mark(-land, { fill: c.a, r: 9 });
      label(ctx, 'half-turn', (x1 + x2) / 2, stage.h * 0.32 - Math.abs(x2 - x1) / 2 - 8, c, { size: 11, bounds: stage, patch: false });
    }
    const rows = [4, 3, 2, 1, 0, -1, -2, -3, -4];
    const top = stage.h * 0.52;
    const rh = (stage.h * 0.46) / rows.length;
    rows.forEach((r, i) => {
      const y = top + i * rh;
      const now = r === a;
      label(ctx, `${f(r)} × ${f(b)} = ${f(r * b)}`, stage.w * 0.3, y, c, { size: 12, color: now ? c.a : c.ink, bounds: stage, patch: false });
      if (i > 0) label(ctx, `${b < 0 ? '+' : '−'}${Math.abs(b)}`, stage.w * 0.72, y - rh / 2, c, { size: 10, patch: false });
    });
  },
  controls: [
    { title: 'Two numbers' },
    { key: 'a', label: 'a', min: -4, max: 4, step: 1 },
    { key: 'b', label: 'b', min: -4, max: 4, step: 1 },
    { readout: [
      ['a × b', (s) => f(s.a * s.b)],
      ['Each step down in a', (s) => `${s.b < 0 ? '+' : s.b > 0 ? '−' : ''}${Math.abs(s.b)}`],
    ] },
  ],
  tex: (s) => `(${s.a})\\times(${s.b})=${s.a * s.b}`,
});
