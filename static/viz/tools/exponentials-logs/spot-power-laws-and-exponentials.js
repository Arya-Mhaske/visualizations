import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { rSquaredLine } from './_exp-log-math.js';

// Made-up measurements: an exact rule times a small steady wobble (+/- 3%), so the pattern is clear but not perfect.
const wobble = (i) => 1 + 0.03 * Math.sin(i * 2.3 + 1);
const make = (xs, rule) => xs.map((x, i) => [x, rule(x) * wobble(i)]);
const SETS = {
  cells: { name: 'Cells doubling', rule: 'y = 3·1.6ˣ (exponential)', data: make([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], (x) => 3 * 1.6 ** x) },
  fall: { name: 'Distance fallen', rule: 'y = 4.9·x² (power law)', data: make([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (x) => 4.9 * x ** 2) },
  kepler: { name: 'Planet period', rule: 'y = x^1.5 (power law)', data: make([0.4, 0.7, 1, 1.5, 5.2, 9.5, 19, 30], (x) => x ** 1.5) },
  taxi: { name: 'Taxi fare', rule: 'y = 20 + 12x (linear)', data: make([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (x) => 20 + 12 * x) },
};
const state = { set: 'cells', axes: 'linear' };
const tx = (s, x) => (s.axes === 'loglog' ? Math.log10(x) : x);
const ty = (s, y) => (s.axes === 'linear' ? y : Math.log10(y));
const points = (s) => SETS[s.set].data.map(([x, y]) => [tx(s, x), ty(s, y)]);
const straightness = (s) => rSquaredLine(points(s));

createTool({
  state,
  label: 'A scatter plot of measured data that you can draw on three kinds of axes: ordinary, semi-log where only the vertical axis counts powers of ten, and log-log where both do. Exponential data goes straight on semi-log axes. Power-law data goes straight on log-log axes. A straightness score reads out for each.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 10], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const pts = points(state);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const padX = (Math.max(...xs) - Math.min(...xs)) * 0.1;
    const padY = (Math.max(...ys) - Math.min(...ys)) * 0.12;
    plot.setRange([Math.min(...xs) - padX, Math.max(...xs) + padX], [Math.min(...ys) - padY, Math.max(...ys) + padY]);
    plot.axes({ xLabel: state.axes === 'loglog' ? 'log₁₀ x' : 'x', yLabel: state.axes === 'linear' ? 'y' : 'log₁₀ y' });
    pts.forEach(([x, y], i) => { if (i) plot.segment(...pts[i - 1], x, y, { color: c.grid, width: 2 }); });
    pts.forEach(([x, y]) => plot.point(x, y, { fill: c.a, r: 6 }));
  },
  controls: [
    { title: 'Pick data and axes' },
    { key: 'set', label: 'Data', options: Object.entries(SETS).map(([k, v]) => [k, v.name]) },
    { key: 'axes', label: 'Axes', options: [['linear', 'Linear'], ['semilog', 'Semi-log'], ['loglog', 'Log-log']] },
    { readout: [
      ['Straightness, r²', (s) => ({ text: fixed(straightness(s), 4), good: straightness(s) > 0.995 })],
      ['Hidden rule', (s) => SETS[s.set].rule],
    ] },
  ],
  tex: (s) => (s.axes === 'linear' ? 'y\\ \\text{against}\\ x' : s.axes === 'semilog' ? '\\log y\\ \\text{against}\\ x\\ :\\ \\text{a line}\\iff y=ab^{x}' : '\\log y\\ \\text{against}\\ \\log x\\ :\\ \\text{a line}\\iff y=ax^{p}'),
});
