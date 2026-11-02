import { createTool } from '../../lib/tool.js';
import { poly, line, label } from '../../lib/draw.js';
import { addUnit } from './_rational-math.js';

const state = { a: 3, b: 4, common: true };

function bar(ctx, c, x0, y, w, parts, shaded, fill, from = 0) {
  for (let i = 0; i < parts; i++) {
    const px = x0 + (i / parts) * w;
    poly(ctx, [[px, y], [px + w / parts, y], [px + w / parts, y + 32], [px, y + 32]], { fill: i >= from && i < from + shaded ? fill : c.paper, stroke: c.ink, width: 2 });
  }
}

createTool({
  state,
  label: 'Three bars. The first is cut into a equal pieces with one shaded. The second is cut into b pieces with one shaded. The third shows the sum cut into equal pieces so that the shaded pieces can be counted.',
  draw(ctx, stage, c) {
    const { a, b } = state;
    const { L, num } = addUnit(a, b);
    const [x0, w] = [16, stage.w - 32];
    bar(ctx, c, x0, 14, w, a, 1, c.fillB);
    label(ctx, `1/${a}`, x0 + w / 2, 62, c, { size: 12, patch: false });
    bar(ctx, c, x0, 80, w, b, 1, c.fillA);
    label(ctx, `1/${b}`, x0 + w / 2, 128, c, { size: 12, patch: false });
    if (state.common) {
      const first = L / a;
      bar(ctx, c, x0, 150, w, L, first, c.fillB);
      for (let i = first; i < first + L / b; i++) {
        const px = x0 + (i / L) * w;
        poly(ctx, [[px, 150], [px + w / L, 150], [px + w / L, 182], [px, 182]], { fill: c.fillA, stroke: c.ink, width: 2 });
      }
      label(ctx, `${L / a} + ${L / b} = ${num} pieces of size 1/${L}`, stage.w / 2, 204, c, { size: 12, bounds: stage, patch: false });
    } else {
      poly(ctx, [[x0, 150], [x0 + w / a, 150], [x0 + w / a, 182], [x0, 182]], { fill: c.fillB, stroke: c.ink, width: 2 });
      poly(ctx, [[x0 + w / a, 150], [x0 + w / a + w / b, 150], [x0 + w / a + w / b, 182], [x0 + w / a, 182]], { fill: c.fillA, stroke: c.ink, width: 2, dash: [4, 4] });
      line(ctx, x0, 190, x0 + w, 190, { color: c.grid, width: 1 });
      label(ctx, 'pieces of different sizes: no total to read', stage.w / 2, 208, c, { size: 12, bounds: stage, patch: false });
    }
  },
  controls: [
    { title: 'Add two fractions' },
    { key: 'a', label: 'First denominator a', min: 2, max: 12, step: 1 },
    { key: 'b', label: 'Second denominator b', min: 2, max: 12, step: 1 },
    { key: 'common', label: 'Cut into equal pieces (LCM)', toggle: true },
    { readout: [
      ['LCM', (s) => String(addUnit(s.a, s.b).L)],
      ['Sum', (s) => `${addUnit(s.a, s.b).num}/${addUnit(s.a, s.b).L}`],
      ['Simplified', (s) => `${addUnit(s.a, s.b).simple[0]}/${addUnit(s.a, s.b).simple[1]}`],
      ['(a + b)/(ab)', (s) => `${s.a + s.b}/${s.a * s.b}`],
    ] },
  ],
  tex: (s) => `\\dfrac1{${s.a}}+\\dfrac1{${s.b}}=\\dfrac{${addUnit(s.a, s.b).L / s.a}+${addUnit(s.a, s.b).L / s.b}}{${addUnit(s.a, s.b).L}}=\\dfrac{${addUnit(s.a, s.b).num}}{${addUnit(s.a, s.b).L}}`,
});
