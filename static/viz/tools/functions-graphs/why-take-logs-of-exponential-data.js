import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { createRng } from '../../lib/rng.js';
import { linearFit } from './_modelling-math.js';

const state = { base: 1.5, log: false };
const data = (s = state) => { const r = createRng(4); return Array.from({ length: 10 }, (_, i) => [i, 3 * s.base ** i * (1 + 0.1 * (r.next() - 0.5))]); };
const fitLog = (s = state) => linearFit(data(s).map(([x, y]) => [x, Math.log(y)]));

createTool({
  state,
  label: 'Ten data points that grow by the same factor each step, with a little scatter. On the ordinary axes they curve upward. Switching the vertical axis to the logarithm of the data turns each multiplication into an addition, so the points fall on a straight line. The slope of that line is the logarithm of the growth factor, and the intercept is the logarithm of the starting value.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 10], y: [0, 120], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    const pts = data();
    if (state.log) {
      const f = fitLog();
      plot.setRange([-0.5, 10], [0, Math.log(Math.max(...pts.map((p) => p[1]))) * 1.15]);
      plot.axes({ xLabel: 'x', yLabel: 'ln y' });
      plot.fn((x) => f.m * x + f.b, { color: c.a, width: 3 });
      pts.forEach(([x, y]) => plot.point(x, Math.log(y), { fill: c.b, r: 6 }));
    } else {
      plot.setRange([-0.5, 10], [0, Math.max(...pts.map((p) => p[1])) * 1.15]);
      plot.axes({ xLabel: 'x', yLabel: 'y' });
      plot.fn((x) => Math.exp(fitLog().b) * Math.exp(fitLog().m * x), { color: c.a, width: 3 });
      pts.forEach(([x, y]) => plot.point(x, y, { fill: c.b, r: 6 }));
    }
  },
  controls: [
    { title: 'Straighten the data' },
    { key: 'log', label: 'Plot ln y instead of y', toggle: true },
    { key: 'base', label: 'Growth factor per step', min: 1.1, max: 2, step: 0.05 },
    { readout: [
      ['Line fitted to ln y: slope', (s) => fixed(fitLog(s).m, 4)],
      ['Growth factor, e^slope', (s) => ({ text: fixed(Math.exp(fitLog(s).m), 3), good: true })],
      ['Starting value, e^intercept', (s) => fixed(Math.exp(fitLog(s).b), 3)],
      ['r of ln y against x', (s) => fixed(fitLog(s).r, 4)],
    ] },
  ],
  tex: (s) => `y=Ab^x\\ \\Rightarrow\\ \\ln y=\\ln A+x\\ln b=${fixed(fitLog(s).b, 3)}+${fixed(fitLog(s).m, 3)}x`,
});
