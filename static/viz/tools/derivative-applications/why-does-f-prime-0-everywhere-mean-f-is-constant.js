import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from './_da.js';

// MVT between x₀ and x: f(x) − f(x₀) = f′(c)(x − x₀). If |f′| ≤ m everywhere, the graph stays inside the wedge |y − y₀| ≤ m|x − x₀|.
const state = { m: 1, x0: 0, x1: 3 };
const f = (x) => state.m * Math.sin(x);
const d = (x) => state.m * Math.cos(x);

createTool({
  state,
  label: 'A graph whose slope never exceeds m. A shaded wedge of slope plus and minus m through the anchor point holds the whole graph. As m shrinks the wedge flattens and squeezes the graph flat.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-3, 3], c }),
  draw(ctx, stage, c, plot) {
    const y0 = f(state.x0);
    plot.axes({ xLabel: 'x', yLabel: 'f' });
    plot.shade((x) => y0 + state.m * Math.abs(x - state.x0), (x) => y0 - state.m * Math.abs(x - state.x0), -4, 4, c.fillC);
    plot.fn(f, { color: c.ink, width: 3 });
    plot.point(state.x0, y0, { fill: c.b }); plot.point(state.x1, f(state.x1), { fill: c.a });
    plot.segment(state.x0, y0, state.x1, y0, { color: c.b, width: 2, dash: [5, 4] });
    plot.segment(state.x1, y0, state.x1, f(state.x1), { color: c.a, width: 3 });
  },
  controls: [
    { title: 'Squeeze the slope' },
    { key: 'm', label: 'Largest slope m = max |f′|', min: 0, max: 2, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'x0', label: 'Anchor x₀', min: -3, max: 3, step: 0.1, format: (v) => v.toFixed(1).replace('-', '−') },
    { key: 'x1', label: 'Second point x', min: -3.5, max: 3.5, step: 0.1, format: (v) => v.toFixed(1).replace('-', '−') },
    { readout: [
      ['Change in f', () => num(f(state.x1) - f(state.x0), 4)],
      ['Largest possible change m|x − x₀|', () => num(state.m * Math.abs(state.x1 - state.x0), 4)],
      ['Inside the wedge?', () => (Math.abs(f(state.x1) - f(state.x0)) <= state.m * Math.abs(state.x1 - state.x0) + 1e-9 ? { text: 'yes', good: true } : { text: 'no', good: false })],
      ['If m = 0', () => (state.m === 0 ? { text: 'no change for any x: f is constant', good: true } : 'wedge becomes a flat line')],
    ] },
  ],
  tex: (s) => `|f(x)-f(x_0)|=|f'(c)|\\,|x-x_0|\\le ${s.m.toFixed(2)}\\,|x-x_0|`,
});
