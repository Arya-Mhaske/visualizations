import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { logistic } from '../exponentials-logs/_exp-log-math.js';

const K = 1000;
const state = { r: 0.5, P0: 100, t: 6 };
const P = (s, P0, t) => logistic(t, s.r, K, P0);
const rate = (s, p) => s.r * p * (1 - p / K);

createTool({
  state,
  label: 'Solution curves of the logistic equation dP by dt equals r P times one minus P over K, starting from several populations. Every curve flattens out at the carrying capacity K. A tangent on your chosen curve shows the growth rate, which is largest when the population is K over 2 and shrinks to nothing as it nears K.',
  setup: (stage, c) => createPlot(stage, { x: [0, 30], y: [0, 1500], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't', yLabel: 'P' });
    plot.segment(0, K, 30, K, { color: c.c, width: 3, dash: [8, 5] });
    plot.segment(0, K / 2, 30, K / 2, { color: c.grid, width: 2, dash: [4, 4] });
    plot.text('K', 28.5, K + 70, { size: 11, color: c.c, patch: false });
    plot.text('K/2', 28.5, K / 2 + 70, { size: 10, patch: false });
    for (const p0 of [30, 300, 1400]) plot.fn((t) => P(state, p0, t), { color: c.b, width: 3 });
    plot.fn((t) => P(state, state.P0, t), { color: c.a, width: 4 });
    const p = P(state, state.P0, state.t);
    plot.fn((t) => p + rate(state, p) * (t - state.t), { color: c.ink, width: 3, domain: [state.t - 3, state.t + 3] });
    plot.point(state.t, p, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Follow one population' },
    { key: 'r', label: 'Growth rate r', min: 0.2, max: 1, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'P0', label: 'Starting population', min: 10, max: 1400, step: 10 },
    { key: 't', label: 'Time', min: 0, max: 30, step: 0.5 },
    { readout: [
      ['Population', (s) => fixed(P(s, s.P0, s.t), 0)],
      ['Growth rate dP/dt', (s) => fixed(rate(s, P(s, s.P0, s.t)), 1)],
      ['Largest possible rate', (s) => `${fixed((s.r * K) / 4, 1)} at P = K/2`],
    ] },
  ],
  tex: (s) => String.raw`\dfrac{dP}{dt}=rP\left(1-\dfrac PK\right)=${fixed(rate(s, P(s, s.P0, s.t)), 1)}`,
});
