import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { n: 4 };

createTool({
  state,
  label: 'A unit square filled with a half, then a quarter, then an eighth and so on, each piece half of the space that remains. The unfilled part is always one half to the power n of the square.',
  draw(ctx, stage, c) {
    const S = Math.min(stage.w, stage.h) - 70;
    const [x0, y0] = [(stage.w - S) / 2, 20];
    let [x, y, w, h] = [0, 0, 1, 1];
    for (let k = 1; k <= state.n; k++) {
      const vertical = k % 2 === 1;
      const [pw, ph] = vertical ? [w / 2, h] : [w, h / 2];
      poly(ctx, [[x0 + x * S, y0 + y * S], [x0 + (x + pw) * S, y0 + y * S], [x0 + (x + pw) * S, y0 + (y + ph) * S], [x0 + x * S, y0 + (y + ph) * S]], { fill: k % 2 ? c.fillA : c.fillB, stroke: c.ink, width: 2 });
      if (vertical) { x += pw; w -= pw; } else { y += ph; h -= ph; }
    }
    poly(ctx, [[x0, y0], [x0 + S, y0], [x0 + S, y0 + S], [x0, y0 + S]], { stroke: c.ink, width: 3 });
    label(ctx, `filled ${fixed(1 - 0.5 ** state.n, 5)} of 1`, stage.w / 2, y0 + S + 22, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Add pieces' },
    { key: 'n', label: 'Pieces n', min: 1, max: 10, step: 1 },
    { readout: [['Sum ½ + ¼ + … + (½)ⁿ', (s) => fixed(1 - 0.5 ** s.n, 6)], ['Left over (½)ⁿ', (s) => fixed(0.5 ** s.n, 6)], ['Infinite sum', () => '1']] },
  ],
  tex: (s) => `\\dfrac12+\\dfrac14+\\cdots+\\dfrac1{2^{${s.n}}}=1-\\dfrac1{2^{${s.n}}}`,
});
