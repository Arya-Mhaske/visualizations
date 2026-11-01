import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { n: 0 };
const f = (x) => x ** 3 - 2 * x - 5;
// Start with a sign change on [2, 3]; each step keeps the half where the sign still changes.
function interval(n) {
  let [a, b] = [2, 3];
  for (let i = 0; i < n; i++) {
    const m = (a + b) / 2;
    if (f(a) * f(m) <= 0) b = m; else a = m;
  }
  return [a, b];
}

createTool({
  state,
  label: 'The graph of a continuous function with its sign change between x equals 2 and x equals 3. At each step the interval is cut in half, and the half where the function still changes sign is kept. By the intermediate value theorem a continuous graph that goes from below the axis to above it must cross the axis in between, so the root is trapped in the kept half. The interval shrinks by half every time.',
  setup: (stage, c) => createPlot(stage, { x: [1.5, 3.5], y: [-8, 20], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const [a, b] = interval(state.n);
    const w = Math.max(b - a, 1e-6);
    const mid = (a + b) / 2;
    plot.setRange([mid - Math.max(w * 3, 1e-6), mid + Math.max(w * 3, 1e-6)], [-Math.max(Math.abs(f(a)), Math.abs(f(b))) * 4 - 1e-9, Math.max(Math.abs(f(a)), Math.abs(f(b))) * 4 + 1e-9]);
    plot.axes({ grid: false });
    plot.fn(f, { color: c.a, width: 4 });
    plot.shade((x) => 1e9, (x) => -1e9, a, b, c.fillC);
    plot.point(a, f(a), { fill: c.b, r: 8 });
    plot.point(b, f(b), { fill: c.d, r: 8 });
  },
  controls: [
    { title: 'Halve the interval' },
    { key: 'n', label: 'Halvings', min: 0, max: 20, step: 1 },
    { readout: [
      ['Interval', (s) => `[${fixed(interval(s.n)[0], 6)}, ${fixed(interval(s.n)[1], 6)}]`],
      ['Width', (s) => (1 / 2 ** s.n).toExponential(2)],
      ['f at the ends', (s) => `${fixed(f(interval(s.n)[0]), 4)} and ${fixed(f(interval(s.n)[1]), 4)}`],
      ['Sign change kept?', (s) => ({ text: f(interval(s.n)[0]) * f(interval(s.n)[1]) <= 0 ? 'yes: the root is inside' : 'no', good: true })],
    ] },
  ],
  tex: (s) => `f(x)=x^3-2x-5,\\quad f(${fixed(interval(s.n)[0], 4)})f(${fixed(interval(s.n)[1], 4)})\\le0`,
});
