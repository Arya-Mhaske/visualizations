import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const HALF = 5730; // years, the half-life of carbon-14
const state = { p: 60 };
const age = (p) => HALF * Math.log2(100 / p);

createTool({
  state,
  label: 'The decay curve of carbon-14 in once-living material, with a dot at each half-life. A horizontal line marks the percentage still left in a sample. Where the line meets the curve, a vertical drop to the time axis reads off the sample age.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40000], y: [0, 105], c, pad: 32 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'years', yLabel: '% ¹⁴C left' });
    plot.fn((t) => 100 * 2 ** (-t / HALF), { color: c.a, width: 4 });
    for (let k = 1; k <= 6; k++) plot.point(k * HALF, 100 * 2 ** -k, { fill: c.fillB, r: 5 });
    plot.segment(0, state.p, age(state.p), state.p, { color: c.b, width: 3 });
    plot.segment(age(state.p), 0, age(state.p), state.p, { color: c.ink, width: 2, dash: [4, 4] });
    plot.point(age(state.p), state.p, { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Measure the sample' },
    { key: 'p', label: 'Carbon-14 left', min: 1, max: 100, step: 0.5, format: (v) => `${fixed(v, 1)}%` },
    { readout: [
      ['Half-lives passed', (s) => fixed(Math.log2(100 / s.p), 2)],
      ['Age', (s) => ({ text: `${fixed(age(s.p), 0)} years`, good: true })],
    ] },
    { text: 'Half-life of carbon-14: 5730 years. Below about 1% left, the signal is too faint to date reliably.' },
  ],
  tex: (s) => `t=5730\\,\\log_2\\dfrac{100}{${fixed(s.p, 1)}}=${fixed(age(s.p), 0)}\\text{ years}`,
});
