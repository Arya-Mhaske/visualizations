import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { r: 7, t: 20, match: false };
const annual = (s, x) => 100 * (1 + s.r / 100) ** x;
const cont = (s, x) => 100 * Math.exp((s.r / 100) * x);
const equivalent = (s) => Math.exp(s.r / 100) - 1;

createTool({
  state,
  label: 'Growth of 100 units over time at the same headline rate r, first as yearly compounding in blue and then as continuous growth in coral. Continuous is faster. A switch draws a third, dashed curve using the yearly rate that matches continuous growth exactly, which lands on top of the coral curve.',
  setup: (stage, c) => createPlot(stage, { x: [0, 20], y: [0, 500], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, state.t], [0, cont(state, state.t) * 1.08]);
    plot.axes({ xLabel: 'years', yLabel: 'amount' });
    plot.fn((x) => annual(state, x), { color: c.b, width: 4 });
    plot.fn((x) => cont(state, x), { color: c.a, width: 4 });
    if (state.match) plot.fn((x) => 100 * (1 + equivalent(state)) ** x, { color: c.ink, width: 2, dash: [5, 5] });
    plot.point(state.t, annual(state, state.t), { fill: c.b, r: 8 });
    plot.point(state.t, cont(state, state.t), { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Same rate, two meanings' },
    { key: 'r', label: 'Rate r', min: 1, max: 30, step: 1, format: (v) => `${v}%` },
    { key: 't', label: 'Years', min: 1, max: 40, step: 1 },
    { key: 'match', label: 'Draw the matching yearly rate', toggle: true },
    { readout: [
      ['Yearly rate r', (s) => `${s.r}%`],
      ['Continuous r equals yearly', (s) => ({ text: `${fixed(equivalent(s) * 100, 2)}%`, good: true })],
      ['After t years: yearly', (s) => fixed(annual(s, s.t), 1)],
      ['After t years: continuous', (s) => fixed(cont(s, s.t), 1)],
    ] },
  ],
  tex: (s) => `e^{${s.r / 100}}-1=${fixed(equivalent(s) * 100, 2)}\\%\\ \\text{a year}\\ \\ \\Rightarrow\\ \\ 100e^{${s.r / 100}\\times ${s.t}}=100(${fixed(1 + equivalent(s), 4)})^{${s.t}}`,
});
