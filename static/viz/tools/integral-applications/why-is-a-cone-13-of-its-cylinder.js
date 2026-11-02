import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from './_ia.js';

// Cone: radius at height y from the tip is (R/H) y. n thin discs: using the outer radius over-counts, the inner under-counts. Both squeeze to ⅓ of π R² H.
const R = 1;
const H = 1;
const state = { n: 5 };
const outer = (n) => ((n + 1) * (2 * n + 1)) / (6 * n * n); // fraction of cylinder volume, discs sticking out
const inner = (n) => ((n - 1) * (2 * n - 1)) / (6 * n * n);

createTool({
  state,
  label: 'A side view of a cone with n thin discs stacked inside it (blue, too small) and sticking out of it (coral, too big). As n grows the two stacks close in on one third of the cylinder.',
  setup: (stage, c) => createPlot(stage, { x: [-1.2, 1.2], y: [-0.1, 1.2], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'r', yLabel: 'height y' });
    const n = state.n;
    for (let i = 1; i <= n; i++) {
      const y0 = (i - 1) / n; const y1 = i / n;
      const rOut = (R / H) * y1; const rIn = (R / H) * y0;
      for (const [r, col] of [[rOut, c.fillA], [rIn, c.fillB]]) {
        const [x1, ya] = plot.toPx(-r, y1);
        const [x2, yb] = plot.toPx(r, y0);
        ctx.fillStyle = col; ctx.fillRect(x1, ya, x2 - x1, yb - ya);
        ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x1, ya, x2 - x1, yb - ya);
      }
    }
    plot.segment(-1, 1, 0, 0, { color: c.ink, width: 3 });
    plot.segment(1, 1, 0, 0, { color: c.ink, width: 3 });
    plot.segment(-1, 1, 1, 1, { color: c.ink, width: 3 });
  },
  controls: [
    { title: 'Stack the discs' },
    { key: 'n', label: 'Number of discs n', min: 1, max: 40, step: 1 },
    { readout: [
      ['Too big: n discs sticking out', () => `${num(outer(state.n), 5)} of the cylinder`],
      ['Too small: discs inside', () => `${num(inner(state.n), 5)} of the cylinder`],
      ['Squeeze', () => `both → 1/3 = ${num(1 / 3, 5)}`],
      ['Gap', () => num(outer(state.n) - inner(state.n), 4)],
    ] },
  ],
  tex: (s) => `\\frac{1}{n}\\sum_{i=1}^{n}\\left(\\frac{i}{n}\\right)^2=\\frac{(n+1)(2n+1)}{6n^2}\\to\\frac13\\ \\ (n=${s.n})`,
});
