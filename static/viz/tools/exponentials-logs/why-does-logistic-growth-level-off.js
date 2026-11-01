import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { logistic } from './_exp-log-math.js';

const state = { view: 'time', r: 0.5, K: 1000, P0: 50, t: 6 };
const P = (s, t = s.t) => logistic(t, s.r, s.K, s.P0);
const growth = (s, p) => s.r * p * (1 - p / s.K);

createTool({
  state,
  label: 'A population growing with limited room. In the time view the coral S-shaped curve starts like the dashed blue exponential, then bends and levels off at the carrying capacity. In the rate view the growth rate is drawn against population size, and it falls to zero as the population fills the space.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [0, 1000], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const { K, r, t } = state;
    if (state.view === 'time') {
      plot.setRange([0, 40], [0, K * 1.12]);
      plot.axes({ xLabel: 'time', yLabel: 'population' });
      plot.segment(0, K, 40, K, { color: c.c, width: 3, dash: [8, 5] });
      plot.fn((x) => state.P0 * Math.exp(r * x), { color: c.b, width: 3, dash: [6, 5] });
      plot.fn((x) => P(state, x), { color: c.a, width: 4 });
      const y = P(state);
      plot.fn((x) => y + growth(state, y) * (x - t), { color: c.ink, width: 3, domain: [t - 3, t + 3] });
      plot.point(t, y, { fill: c.fillY, r: 8 });
      plot.text('capacity K', 36, K + K * 0.05, { size: 10, color: c.c, patch: false });
    } else {
      plot.setRange([0, K], [0, (r * K) / 3.2]);
      plot.axes({ xLabel: 'population P', yLabel: 'growth rate' });
      plot.fn((p) => r * p, { color: c.b, width: 3, dash: [6, 5] });
      plot.fn((p) => growth(state, p), { color: c.a, width: 4 });
      const y = P(state);
      plot.segment(y, 0, y, growth(state, y), { color: c.grid, width: 2, dash: [4, 4] });
      plot.point(y, growth(state, y), { fill: c.fillY, r: 8 });
    }
  },
  controls: [
    { title: 'Limit the room' },
    { key: 'view', label: 'Show', options: [['time', 'Population over time'], ['rate', 'Growth rate']] },
    { key: 't', label: 'Time', min: 0, max: 40, step: 0.5 },
    { key: 'r', label: 'Growth rate r', min: 0.2, max: 1, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'K', label: 'Capacity K', min: 200, max: 2000, step: 100 },
    { key: 'P0', label: 'Starting population', min: 10, max: 150, step: 10 },
    { readout: [
      ['Population', (s) => fixed(P(s), 0)],
      ['Share of capacity', (s) => `${fixed((P(s) / s.K) * 100, 1)}%`],
      ['Growth rate now', (s) => fixed(growth(s, P(s)), 1)],
      ['If unlimited', (s) => `${fixed(s.r * P(s), 1)}`],
    ] },
  ],
  tex: (s) => `\\dfrac{dP}{dt}=rP\\left(1-\\dfrac{P}{K}\\right)=${fixed(s.r, 2)}\\times ${fixed(P(s), 0)}\\times ${fixed(1 - P(s) / s.K, 3)}=${fixed(growth(s, P(s)), 1)}`,
});
