import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { axisCross, circleRay, dishRay, missDistance } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

const state = { shape: 'parabola', n: 7, a: 2 };
const R = 9;
const rays = (s = state) => {
  const reach = Math.min(6.5, 3 * s.a + 1);
  return Array.from({ length: s.n }, (_, i) => (s.n === 1 ? reach * 0.7 : -reach + (2 * reach * i) / (s.n - 1))).filter((y) => Math.abs(y) > 0.05)
    .map((y0) => (s.shape === 'parabola' ? dishRay(s.a, y0) : circleRay(2 * s.a, (y0 * 1.8 * s.a) / Math.min(6.5, 3 * s.a + 1))));
};
const crossings = (s = state) => rays(s).map(({ hit, out }) => axisCross(hit, out)).filter((x) => x !== null);
const spread = (s = state) => { const x = crossings(s); return x.length ? Math.max(...x) - Math.min(...x) : 0; };

createTool({
  state,
  label: 'A dish cross-section opening to the right with a focus marked on its axis. Parallel signals arrive from the right, hit the dish and reflect. For the parabola every reflected ray passes through the same point, the focus. For a circular dish of the same width the reflected rays cross the axis at different places and never meet at one point.',
  setup: (stage, c) => createPlot(stage, { x: [-1, R], y: [-6, 6], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '' });
    const pts = state.shape === 'parabola'
      ? trace((t) => [state.a * t * t, 2 * state.a * t], -1.8, 1.8, 120)
      : trace((t) => [2 * state.a * (1 - Math.cos(t)), 2 * state.a * Math.sin(t)], -1.1, 1.1, 120);
    curve(plot, pts, { color: c.ink, width: 5 });
    rays().forEach(({ hit, out }) => {
      plot.segment(R, hit[1], hit[0], hit[1], { color: c.b, width: 2 });
      const cross = axisCross(hit, out);
      const t = cross === null ? 1 : (cross - hit[0]) / out[0];
      plot.segment(hit[0], hit[1], hit[0] + out[0] * t, hit[1] + out[1] * t, { color: c.a, width: 2 });
    });
    plot.point(state.a, 0, { fill: c.c, r: 8 });
    plot.text('focus', state.a, -0.9, { size: 11, patch: false });
  },
  controls: [
    { title: 'Send signals in' },
    { key: 'shape', label: 'Dish shape', options: [['parabola', 'Parabola'], ['circle', 'Circle']] },
    { key: 'n', label: 'Number of rays', min: 3, max: 15, step: 2 },
    { key: 'a', label: 'Focus distance, a', min: 1, max: 3, step: 0.5 },
    { readout: [
      ['Rays cross the axis between', (s) => { const x = crossings(s); return x.length ? `${fixed(Math.min(...x), 2)} and ${fixed(Math.max(...x), 2)}` : 'none'; }],
      ['Spread', (s) => ({ text: fixed(spread(s), 3), good: spread(s) < 1e-6 })],
      ['Nearest the focus', (s) => `${fixed(Math.min(...rays(s).map(({ hit, out }) => missDistance(hit, out, [s.a, 0]))), 3)} off`],
    ] },
  ],
  tex: (s) => (s.shape === 'parabola' ? `y^2=4ax,\\ F=(a,0)=(${s.a},0):\\ \\text{every ray passes through }F` : `\\text{circle of radius }${2 * s.a}:\\ \\text{no single meeting point}`),
});
