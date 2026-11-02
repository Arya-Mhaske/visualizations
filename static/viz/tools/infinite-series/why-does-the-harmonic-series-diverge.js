import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, sumTo, num } from './_is.js';
import { line } from '../../lib/draw.js';

// Oresme: 1/3 + 1/4 > 1/2, 1/5 + … + 1/8 > 1/2, and each block of 2^k terms is worth more than 1/2.
const state = { K: 6 };
const KMAX = 16;
const block = (k) => sumTo((n) => 1 / n, 2 ** (k - 1) + 1, 2 ** k); // terms 2^(k-1)+1 … 2^k
const total = (k) => sumTo((n) => 1 / n, 1, 2 ** k);
const [boxA, boxB] = boxes(2);

createTool({
  state,
  label: 'Top: bars showing the sum of each block of terms, 2, then 3 to 4, then 5 to 8 and so on, each above the line at one half. Bottom: the running total S at 2 to the k terms against the guaranteed floor 1 plus k over 2.',
  setup: (stage, c) => ({
    a: createPlot(stage, { x: [0, KMAX + 1], y: [0, 1], c, box: boxA }),
    b: createPlot(stage, { x: [0, KMAX + 1], y: [0, 10], c, box: boxB }),
  }),
  draw(ctx, stage, c, { a, b }) {
    a.axes({ xLabel: 'block k', yLabel: 'block sum' });
    for (let k = 1; k <= state.K; k++) {
      const [x1, y1] = a.toPx(k - 0.35, block(k));
      const [x2, y2] = a.toPx(k + 0.35, 0);
      ctx.fillStyle = c.fillC;
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    }
    a.segment(0, 0.5, KMAX + 1, 0.5, { color: c.a, width: 3, dash: [7, 4] });
    a.text('½', 0.4, 0.57, { color: c.a, size: 13 });
    b.axes({ xLabel: 'k', yLabel: 'total' });
    b.fn((x) => 1 + x / 2, { color: c.b, width: 2.5, dash: [7, 4], domain: [0, KMAX] });
    for (let k = 0; k <= state.K; k++) b.point(k, total(k), { fill: c.a, r: 5 });
    const [fx, fy] = b.toPx(state.K, total(state.K));
    line(ctx, fx, fy, fx, b.toPx(state.K, 0)[1], { color: c.ink, width: 1.5 });
  },
  controls: [
    { title: 'Group the terms' },
    { key: 'K', label: 'Blocks k', min: 1, max: KMAX, step: 1 },
    { readout: [
      ['Terms used 2ᵏ', () => String(2 ** state.K)],
      ['Total S', () => num(total(state.K), 4)],
      ['Guaranteed floor', () => num(1 + state.K / 2, 4)],
      ['Smallest block', () => num(block(state.K), 4)],
    ] },
  ],
  tex: (s) => `S_{2^{${s.K}}}=${num(total(s.K), 3)}\\ \\ge\\ 1+\\frac{${s.K}}{2}=${num(1 + s.K / 2, 3)}`,
});
