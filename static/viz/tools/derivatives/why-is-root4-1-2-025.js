import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { x: 4.1, w: 0.4 };
const L = (x) => 2 + (x - 4) / 4;

createTool({
  state,
  label: 'The square-root curve near x equals 4 with its tangent line. A marker at your chosen x shows the true root on the curve and the tangent estimate on the line. Zoom in and the two are impossible to tell apart.',
  setup: (stage, c) => createPlot(stage, { x: [3, 5], y: [1.5, 2.5], c }),
  draw(ctx, stage, c, plot) {
    const w = Math.max(state.w, Math.abs(state.x - 4) * 1.4);
    plot.setRange([4 - w, 4 + w], [2 - w / 4 - w * 0.06, 2 + w / 4 + w * 0.06]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => Math.sqrt(x), { color: c.ink, width: 4 });
    plot.fn(L, { color: c.a, width: 3 });
    plot.point(4, 2, { fill: c.fillY, r: 7 });
    plot.segment(state.x, Math.sqrt(state.x), state.x, L(state.x), { color: c.b, width: 4 });
    plot.point(state.x, L(state.x), { fill: c.a, r: 7 });
    plot.point(state.x, Math.sqrt(state.x), { fill: c.ink, r: 5 });
  },
  controls: [
    { title: 'Estimate a square root' },
    { key: 'x', label: 'Estimate √x at x =', min: 3.5, max: 4.5, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'w', label: 'Zoom: window half-width', min: 0.02, max: 2, step: 0.02, format: (v) => fixed(v, 2) },
    { readout: [
      ['Tangent estimate', (s) => fixed(L(s.x), 5)],
      ['True value', (s) => fixed(Math.sqrt(s.x), 5)],
      ['Error', (s) => ({ text: fixed(L(s.x) - Math.sqrt(s.x), 6), good: true })],
    ] },
  ],
  tex: (s) => `\\sqrt{x}\\approx 2+\\dfrac{x-4}{4}\\ :\\ \\ \\sqrt{${fixed(s.x, 2)}}\\approx ${fixed(L(s.x), 5)}\\ \\ (\\text{true }${fixed(Math.sqrt(s.x), 5)})`,
});
