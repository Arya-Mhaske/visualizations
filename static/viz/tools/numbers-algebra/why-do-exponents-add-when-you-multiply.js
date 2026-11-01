import { createTool } from '../../lib/tool.js';
import { label, poly } from '../../lib/draw.js';

const state = { a: 2, m: 3, n: 4 };

createTool({
  state,
  label: 'Two rows of boxes. The first row has m boxes, standing for a to the m, which means m copies of a multiplied together. The second row has n boxes for a to the n. Joining the rows gives one row of m plus n boxes, which is a to the m plus n. Counting the boxes is adding the exponents.',
  draw(ctx, stage, c) {
    const total = state.m + state.n;
    const cell = Math.min((stage.w - 24) / Math.max(total, 1), 44);
    const x0 = (stage.w - total * cell) / 2;
    const row = (count, y, offset, fill) => {
      for (let i = 0; i < count; i++) {
        const x = x0 + (offset + i) * cell;
        poly(ctx, [[x + 2, y + 2], [x + cell - 2, y + 2], [x + cell - 2, y + cell - 2], [x + 2, y + cell - 2]], { fill, stroke: c.ink, width: 2 });
        label(ctx, `${state.a}`, x + cell / 2, y + cell / 2, c, { size: Math.min(14, cell * 0.5), bounds: stage, patch: false });
      }
    };
    row(state.m, stage.h * 0.18, 0, c.fillA);
    row(state.n, stage.h * 0.18, state.m, c.fillB);
    label(ctx, `a^${state.m}  ×  a^${state.n}`, stage.w / 2, stage.h * 0.1, c, { size: 12, bounds: stage });
    row(state.m + state.n, stage.h * 0.55, 0, c.fillC);
    label(ctx, `${state.m} + ${state.n} = ${total} factors`, stage.w / 2, stage.h * 0.55 + cell + 18, c, { size: 13, bounds: stage });
  },
  controls: [
    { title: 'Join two rows' },
    { key: 'a', label: 'Base, a', min: 2, max: 9, step: 1 },
    { key: 'm', label: 'First row, m', min: 1, max: 8, step: 1 },
    { key: 'n', label: 'Second row, n', min: 1, max: 8, step: 1 },
    { readout: [
      ['aᵐ × aⁿ', (s) => `${s.a ** s.m} × ${s.a ** s.n} = ${s.a ** s.m * s.a ** s.n}`],
      ['aᵐ⁺ⁿ', (s) => ({ text: `${s.a ** (s.m + s.n)}`, good: s.a ** s.m * s.a ** s.n === s.a ** (s.m + s.n) })],
    ] },
  ],
  tex: (s) => `${s.a}^{${s.m}}\\cdot${s.a}^{${s.n}}=${s.a}^{${s.m}+${s.n}}=${s.a}^{${s.m + s.n}}`,
});
