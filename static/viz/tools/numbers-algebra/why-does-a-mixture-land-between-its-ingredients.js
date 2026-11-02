import { createTool } from '../../lib/tool.js';
import { line, poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { blend } from './_linear-equations-math.js';

const state = { s1: 10, q1: 2, s2: 60, q2: 1 };
const mix = (s) => blend(s.s1, s.q1, s.s2, s.q2);

createTool({
  state,
  label: 'A lever on a scale of strength from 0 to 100 per cent. Two weights sit at the strengths of the two solutions, their size showing the amount of each. The pivot sits at the strength of the mixture, between them and nearer the heavier weight.',
  draw(ctx, stage, c) {
    const [x0, x1, y] = [24, stage.w - 24, stage.h * 0.55];
    const X = (v) => x0 + (v / 100) * (x1 - x0);
    line(ctx, x0, y, x1, y, { color: c.ink, width: 4 });
    for (let v = 0; v <= 100; v += 20) {
      line(ctx, X(v), y, X(v), y + 8, { color: c.ink, width: 2 });
      label(ctx, `${v}%`, X(v), y + 22, c, { size: 10, patch: false });
    }
    const size = (q) => 14 + q * 8;
    [[state.s1, state.q1, c.b], [state.s2, state.q2, c.a]].forEach(([s, q, col]) => {
      const h = size(q);
      poly(ctx, [[X(s) - h / 2, y - h], [X(s) + h / 2, y - h], [X(s) + h / 2, y], [X(s) - h / 2, y]], { fill: col, stroke: c.ink });
      label(ctx, `${q} L`, X(s), y - h / 2, c, { size: 11, patch: false });
    });
    const m = mix(state);
    poly(ctx, [[X(m) - 12, y + 40], [X(m) + 12, y + 40], [X(m), y + 4]], { fill: c.c, stroke: c.ink });
    label(ctx, `mixture ${fixed(m, 1)}%`, X(m), y + 60, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Two solutions' },
    { key: 's1', label: 'Strength 1 (%)', min: 0, max: 100, step: 5 },
    { key: 'q1', label: 'Amount 1 (litres)', min: 1, max: 8, step: 1 },
    { key: 's2', label: 'Strength 2 (%)', min: 0, max: 100, step: 5 },
    { key: 'q2', label: 'Amount 2 (litres)', min: 1, max: 8, step: 1 },
    { readout: [
      ['Mixture strength', (s) => `${fixed(mix(s), 2)}%`],
      ['Between the two?', (s) => ({ text: mix(s) >= Math.min(s.s1, s.s2) && mix(s) <= Math.max(s.s1, s.s2) ? 'yes' : 'no', good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{${s.s1}\\times${s.q1}+${s.s2}\\times${s.q2}}{${s.q1}+${s.q2}}=${fixed(mix(s), 2)}\\%`,
});
