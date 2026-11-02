import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { trapSum, leftSum, simpSum, speck, num } from '../integral-applications/_ia.js';

// A car's speed is read every few seconds (made-up readings from a smooth model). Estimate the distance from the table alone.
const v = (t) => Math.round(25 * (1 - Math.exp(-t / 20)) * 10) / 10; // m/s
const dist = (t) => 25 * (t - 20 * (1 - Math.exp(-t / 20)));
const T = 60;
const state = { gap: 10, rule: 'trap' };
const times = () => { const out = []; for (let t = 0; t <= T + 1e-9; t += state.gap) out.push(t); return out; };
// Piecewise-linear f through the readings: exact trapezoid areas, and a table for Simpson.
const table = () => times().map((t) => v(t));
const est = () => {
  const ys = table(); const h = state.gap;
  const n = ys.length - 1;
  if (state.rule === 'left') return ys.slice(0, n).reduce((s, y) => s + y * h, 0);
  if (state.rule === 'trap') return ys.reduce((s, y, i) => s + (i === 0 || i === n ? y / 2 : y) * h, 0);
  if (n % 2) return NaN;
  return (h / 3) * ys.reduce((s, y, i) => s + y * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2), 0);
};

createTool({
  state,
  label: 'Dots for the speed readings and bars or trapezoids joining them. The shaded area is the estimated distance. The true curve is drawn for comparison.',
  setup: (stage, c) => createPlot(stage, { x: [0, 60], y: [0, 30], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'speed (m/s)' });
    plot.fn((t) => 25 * (1 - Math.exp(-t / 20)), { color: c.grid, width: 2 });
    const ts = times();
    ts.forEach((t, i) => {
      if (i === ts.length - 1) return;
      const [t1, y0, y1] = [ts[i + 1], v(t), v(ts[i + 1])];
      if (state.rule === 'left') plot.shade(() => y0, null, t, t1, c.fillA);
      else plot.shade((x) => y0 + ((y1 - y0) * (x - t)) / (t1 - t), null, t, t1, c.fillB);
    });
    ts.forEach((t) => speck(ctx, plot, t, v(t), 5, c.a, c.ink));
  },
  controls: [
    { title: 'Read the dial' },
    { key: 'gap', label: 'Time between readings', options: [[20, '20 s'], [10, '10 s'], [5, '5 s'], [2.5, '2.5 s']] },
    { key: 'rule', label: 'Rule', options: [['left', 'Left bars'], ['trap', 'Trapezoids'], ['simp', 'Simpson']] },
    { readout: [
      ['Readings (m/s)', () => table().join(', ')],
      ['Estimated distance', () => `${num(est(), 6)} m`],
      ['True distance of the model', () => `${num(dist(T), 6)} m`],
      ['Error', () => num(est() - dist(T), 3)],
    ] },
  ],
  tex: () => 's\\approx\\sum v_i\\,\\Delta t\\quad\\text{(from the table only)}',
});
