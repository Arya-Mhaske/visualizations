import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { stackBoxes } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

// Direct DFT: n × n multiplications. FFT: split into evens and odds, so T(n) = 2 T(n/2) + n/2 and T(n) = (n/2) log2 n.
const state = { k: 4 };
const direct = (k) => (2 ** k) ** 2;
const fast = (k) => (2 ** k / 2) * k;

createTool({
  state,
  label: 'Top: a tree showing the transform of size n split in halves again and again until single numbers are left. Every level of the tree does about n over 2 multiplications to recombine, and there are log base 2 of n levels. Bottom: the number of multiplications for the direct method and for the FFT as n grows, on a log scale, with the gap widening quickly.',
  setup: (stage, c) => {
    const [top, bottom] = stackBoxes(2);
    return { plot: createPlot(stage, { x: [1, 12], y: [0, 8], c, pad: 26, box: bottom }), top };
  },
  draw(ctx, stage, c, { plot, top }) {
    const area = top(stage);
    const levels = Math.min(state.k, 5);
    const rowH = (area.h - 20) / (levels + 1);
    for (let j = 0; j <= levels; j++) {
      const boxes = 2 ** j;
      const w = (area.w - 24) / boxes;
      for (let b = 0; b < boxes; b++) {
        poly(ctx, [[12 + b * w + 1, area.y + 8 + j * rowH], [12 + (b + 1) * w - 1, area.y + 8 + j * rowH], [12 + (b + 1) * w - 1, area.y + 8 + j * rowH + rowH * 0.6], [12 + b * w + 1, area.y + 8 + j * rowH + rowH * 0.6]], { fill: j === levels ? c.fillC : c.fillB, stroke: c.ink, width: 1.5 });
      }
    }
    plot.axes({ xLabel: 'k, where n = 2^k', yLabel: 'log₁₀ multiplications' });
    plot.fn((k) => Math.log10(direct(Math.round(k))), { color: c.a, width: 4, domain: [1, 12] });
    plot.fn((k) => Math.log10(fast(Math.round(k))), { color: c.c, width: 4, domain: [1, 12] });
    plot.segment(state.k, 0, state.k, 8, { color: c.grid, width: 2, dash: [5, 4] });
    plot.point(state.k, Math.log10(direct(state.k)), { fill: c.fillA, r: 7 });
    plot.point(state.k, Math.log10(fast(state.k)), { fill: c.fillC, r: 7 });
    plot.text('n²', 11.3, Math.log10(direct(12)) - 0.6, { size: 11, color: c.a, patch: false });
    plot.text('(n/2)log₂n', 11, Math.log10(fast(12)) + 0.6, { size: 11, color: c.c, align: 'right', patch: false });
  },
  controls: [
    { title: 'Split in halves' },
    { key: 'k', label: 'Size n = 2ᵏ, k', min: 1, max: 12, step: 1, format: (n) => `${n}  (n = ${2 ** n})` },
    { readout: [
      ['Direct: n²', (s) => String(direct(s.k))],
      ['FFT: (n/2) log₂ n', (s) => String(fast(s.k))],
      ['Speed-up', (s) => ({ text: `${fixed(direct(s.k) / fast(s.k), 1)} ×`, good: true })],
      ['Levels in the tree', (s) => String(s.k)],
    ] },
  ],
  tex: (s) => `n^2=${direct(s.k)}\\ \\text{against}\\ \\dfrac{n}{2}\\log_2 n=${fast(s.k)}`,
});
