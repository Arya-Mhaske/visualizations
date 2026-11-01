import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const FN = {
  sqrt2: { name: 'x² − 2', f: (x) => x * x - 2, d: (x) => 2 * x, root: Math.SQRT2, x0: 2 },
  cbrt2: { name: 'x³ − 2', f: (x) => x ** 3 - 2, d: (x) => 3 * x * x, root: Math.cbrt(2), x0: 2 },
  cosx: { name: 'cos x − x', f: (x) => Math.cos(x) - x, d: (x) => -Math.sin(x) - 1, root: 0.7390851332151607, x0: 2 },
};
const state = { fn: 'sqrt2', x0: 2, n: 4 };
const F = () => FN[state.fn];
function iterates(s) {
  const { f, d, root } = FN[s.fn];
  const xs = [s.x0];
  for (let i = 0; i < 7; i++) xs.push(xs[i] - f(xs[i]) / d(xs[i]));
  return xs.map((x) => ({ x, digits: Math.min(15, Math.max(0, -Math.log10(Math.abs(x - root) || 1e-16))) }));
}

createTool({
  state,
  label: 'A graph of how many correct decimal places Newton method has after each step, for a start value you choose. The dots climb steeply, roughly doubling at every step, while a dashed line shows a method that gains the same small amount each time, as bisection does. A table of the iterates sits above.',
  setup: (stage, c) => createPlot(stage, { x: [0, 7], y: [0, 16], c, box: (st) => ({ x: 0, y: st.h * 0.42, w: st.w, h: st.h * 0.58 }) }),
  draw(ctx, stage, c, plot) {
    const it = iterates(state);
    it.slice(0, state.n + 1).forEach((p, i) => {
      label(ctx, `n=${i}`, 12, 18 + i * 17, c, { size: 11, align: 'left', patch: false });
      label(ctx, fixed(p.x, 10), 70, 18 + i * 17, c, { size: 11, align: 'left', patch: false });
      label(ctx, `${fixed(p.digits, 1)} correct`, stage.w - 12, 18 + i * 17, c, { size: 11, align: 'right', patch: false, color: c.c });
    });
    plot.axes({ xLabel: 'step', yLabel: 'digits' });
    plot.segment(0, 0, 7, 7 * 0.301, { color: c.b, width: 3, dash: [6, 5] });
    it.slice(0, state.n + 1).forEach((p, i) => {
      if (i) plot.segment(i - 1, it[i - 1].digits, i, p.digits, { color: c.a, width: 3 });
      plot.point(i, p.digits, { fill: c.a, r: 6 });
    });
  },
  controls: (tool) => [
    { title: 'Slide down tangents' },
    { key: 'fn', label: 'Solve f(x) = 0 for', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'x0', label: 'Start x₀', min: 0.5, max: 3, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'n', label: 'Steps taken', min: 0, max: 7, step: 1 },
    { readout: [
      ['Latest estimate', (s) => fixed(iterates(s)[s.n].x, 12)],
      ['Correct digits', (s) => ({ text: fixed(iterates(s)[s.n].digits, 1), good: true })],
    ] },
  ],
  tex: (s) => `x_{n+1}=x_n-\\dfrac{f(x_n)}{f'(x_n)}`,
});
