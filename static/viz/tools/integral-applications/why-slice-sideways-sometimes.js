import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from '../integrals/_ig.js';

// Region between the parabola x = y² and the line x = y + 2 (they meet at y = −1 and y = 2). Area 9/2.
// Vertical strips need two integrals: below x = 1 the bottom edge is the parabola's lower half, above it is the line.
const state = { dir: 'x', n: 14 };
const F = {
  right: (y) => y + 2,
  left: (y) => y * y,
};
const topX = (x) => (x <= 4 ? Math.sqrt(x) : 0);
const botX = (x) => (x < 1 ? -Math.sqrt(x) : x - 2);
const areaY = () => exact((y) => F.right(y) - F.left(y), -1, 2);
const areaX = () => exact((x) => Math.sqrt(x) - -Math.sqrt(x), 0, 1) + exact((x) => Math.sqrt(x) - (x - 2), 1, 4);

const tool = createTool({
  state,
  label: 'The region between a sideways parabola and a straight line, cut into strips. In the vertical view, the strips change their bottom edge at x equals 1, so two integrals are needed. In the horizontal view, every strip runs from the parabola to the line, so one integral does it all.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 4.8], y: [-2.2, 2.8], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const N = state.n;
    if (state.dir === 'x') {
      const n1 = Math.max(1, Math.round(N / 4));
      const edges = [...Array.from({ length: n1 }, (_, i) => i / n1), ...Array.from({ length: N - n1 + 1 }, (_, i) => 1 + (3 * i) / (N - n1))];
      for (let i = 0; i < edges.length - 1; i++) {
        const x0 = edges[i];
        const x1 = edges[i + 1];
        const xm = (x0 + x1) / 2;
        const hi = Math.sqrt(xm);
        const lo = botX(xm);
        const col = xm < 1 ? c.fillA : c.fillB;
        const [px0, py0] = plot.toPx(x0, hi);
        const [px1, py1] = plot.toPx(x1, lo);
        ctx.fillStyle = col;
        ctx.fillRect(px0, py0, px1 - px0, py1 - py0);
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 1;
        ctx.strokeRect(px0, py0, px1 - px0, py1 - py0);
      }
      plot.segment(1, -2.2, 1, 2.8, { color: c.ink, width: 2, dash: [5, 4] });
    } else {
      for (let i = 0; i < N; i++) {
        const y0 = -1 + (3 * i) / N;
        const y1 = -1 + (3 * (i + 1)) / N;
        const ym = (y0 + y1) / 2;
        const [px0, py0] = plot.toPx(F.left(ym), y1);
        const [px1, py1] = plot.toPx(F.right(ym), y0);
        ctx.fillStyle = c.fillC;
        ctx.fillRect(px0, py0, px1 - px0, py1 - py0);
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 1;
        ctx.strokeRect(px0, py0, px1 - px0, py1 - py0);
      }
    }
    plot.fn((x) => Math.sqrt(Math.max(x, 0)), { color: c.a, domain: [0, 4.6] });
    plot.fn((x) => -Math.sqrt(Math.max(x, 0)), { color: c.a, domain: [0, 4.6] });
    plot.fn((x) => x - 2, { color: c.b, domain: [0, 4.8] });
  },
  controls: () => [
    { title: 'Choose the slices' },
    { key: 'dir', label: 'Slice', options: [['x', 'vertical (dx)'], ['y', 'horizontal (dy)']] },
    { key: 'n', label: 'Strips', min: 4, max: 40, step: 1 },
    { readout: [
      ['Integrals needed', (s) => (s.dir === 'x' ? '2 (split at x = 1)' : '1')],
      ['Area', (s) => (s.dir === 'x' ? fixed(areaX(), 5) : fixed(areaY(), 5))],
      ['Exact', () => '9/2 = 4.5'],
    ] },
  ],
  tex: (s) => (s.dir === 'x'
    ? 'A=\\int_0^1 2\\sqrt{x}\\,dx+\\int_1^4\\left(\\sqrt{x}-x+2\\right)dx'
    : 'A=\\int_{-1}^{2}\\left[(y+2)-y^2\\right]dy'),
});
void topX;

tool.update();
