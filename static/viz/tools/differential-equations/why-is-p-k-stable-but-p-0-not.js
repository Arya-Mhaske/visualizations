import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { logistic } from '../exponentials-logs/_exp-log-math.js';

const K = 1000;
const state = { view: 'time', r: 0.5, P0: 20 };
const f = (s, p) => s.r * p * (1 - p / K);
const path = (s, t) => (s.P0 === 0 ? 0 : logistic(t, s.r, K, s.P0));
const fate = (s) => (s.P0 === 0 ? 'stays at 0 exactly' : s.P0 === K ? 'stays at K exactly' : 'moves to K');

createTool({
  state,
  label: 'The two equilibria of the logistic equation, where the population does not change: P equals 0 and P equals K. In the time view you start a population at a value near one and watch where it goes. In the phase view the growth rate is drawn against the population with arrows on the axis showing which way P moves: away from 0 and towards K.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [0, 1500], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    if (state.view === 'time') {
      plot.setRange([0, 40], [0, 1500]);
      plot.axes({ xLabel: 't', yLabel: 'P' });
      plot.segment(0, K, 40, K, { color: c.c, width: 3, dash: [8, 5] });
      plot.segment(0, 0, 40, 0, { color: c.b, width: 3, dash: [8, 5] });
      plot.fn((t) => path(state, t), { color: c.a, width: 4 });
      plot.point(0, state.P0, { fill: c.fillY, r: 8 });
    } else {
      const top = (state.r * K) / 4;
      plot.setRange([0, 1500], [-top * 1.8, top * 1.4]);
      plot.axes({ xLabel: 'P', yLabel: 'dP/dt' });
      plot.fn((p) => f(state, p), { color: c.a, width: 4 });
      for (let p = 60; p < 1500; p += 120) {
        const dir = Math.sign(f(state, p));
        const [x, y] = plot.toPx(p, 0);
        arrow(ctx, x - dir * 14, y, x + dir * 14, y, { color: dir > 0 ? c.c : c.b, width: 3, head: 10 });
      }
      plot.point(0, 0, { fill: c.paper, r: 9 });
      plot.point(K, 0, { fill: c.c, r: 9 });
      plot.point(state.P0, f(state, state.P0), { fill: c.fillY, r: 8 });
    }
  },
  controls: [
    { title: 'Nudge the population' },
    { key: 'view', label: 'Show', options: [['time', 'Over time'], ['phase', 'Rate and arrows']] },
    { key: 'r', label: 'Growth rate r', min: 0.2, max: 1, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'P0', label: 'Starting population', min: 0, max: 1500, step: 10 },
    { readout: [
      ['Rate at the start', (s) => fixed(f(s, s.P0), 1)],
      ['What happens', (s) => ({ text: fate(s), good: s.P0 !== 0 })],
    ] },
  ],
  tex: (s) => String.raw`\dfrac{dP}{dt}=rP\left(1-\dfrac PK\right)=0\iff P=0\text{ or }P=K=${K}`,
});
