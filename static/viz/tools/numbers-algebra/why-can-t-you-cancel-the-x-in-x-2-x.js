import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { CANCEL, agree } from './_rational-math.js';

const state = { i: 0, x: 3 };
const item = (s) => CANCEL[s.i];
const val = (v) => (Number.isFinite(v) ? fixed(v, 3) : 'undefined');

createTool({
  state,
  label: 'Two curves: the original fraction in blue and its claimed simplification as a dashed coral curve. When the claim is wrong they separate, and when it is right they lie on top of each other.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 5], y: [-8, 8], c }),
  draw(ctx, stage, c, plot) {
    const it = item(state);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(it.f, { color: c.b });
    plot.fn(it.g, { color: c.a, dash: [7, 5] });
    if (Number.isFinite(it.f(state.x))) plot.point(state.x, it.f(state.x), { fill: c.b, r: 6 });
    plot.point(state.x, it.g(state.x), { fill: c.a, r: 4 });
  },
  controls: [
    { title: 'Is the cancel legal?' },
    { key: 'i', label: 'Claim', options: CANCEL.map((x, k) => [k, `Claim ${k + 1}`]) },
    { key: 'x', label: 'Probe x', min: -4, max: 4, step: 0.5 },
    { readout: [
      ['Claim', (s) => item(s).name],
      ['Original at x', (s) => val(item(s).f(s.x))],
      ['Claimed at x', (s) => val(item(s).g(s.x))],
      ['Agree here?', (s) => ({ text: agree(item(s), s.x) ? 'yes' : 'no', good: agree(item(s), s.x) })],
      ['Why', (s) => item(s).why],
    ] },
  ],
  tex: (s) => `${item(s).tex}\\overset{?}{=}${item(s).claim}`,
});
