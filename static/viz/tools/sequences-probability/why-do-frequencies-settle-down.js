import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createRng } from '../../lib/rng.js';
import { fixed } from '../../lib/format.js';
import { runShares } from './_probability-math.js';

const state = { k: 25, p: 50, runs: 3 };
const MAX = 5000;
const cache = new Map();
const runsFor = (p) => {
  if (!cache.has(p)) cache.set(p, [0, 1, 2, 3, 4].map((i) => runShares(createRng(100 + i), p / 100, MAX)));
  return cache.get(p);
};
const flips = (s) => Math.round(10 ** (s.k / 10));

createTool({
  state,
  label: 'Lines show the running share of heads against the number of coin flips on a log scale. They swing at first and then settle near the true probability.',
  setup: (stage, c) => createPlot(stage, { x: [0, 3.7], y: [0, 1], c }),
  draw(ctx, stage, c, plot) {
    const n = flips(state);
    const colours = [c.a, c.b, c.c, c.d, c.ink];
    plot.axes({ xLabel: 'log₁₀ (flips)', yLabel: 'share of heads' });
    plot.segment(0, state.p / 100, 3.7, state.p / 100, { color: c.ink, dash: [6, 5], width: 2 });
    const top = Math.log10(n);
    runsFor(state.p).slice(0, state.runs).forEach((run, i) => {
      plot.fn((x) => run[Math.max(0, Math.round(10 ** x) - 1)], { color: colours[i], domain: [0, top] });
    });
    plot.segment(top, 0, top, 1, { color: c.ink, width: 2 });
  },
  controls: [
    { title: 'Flip a coin' },
    { key: 'k', label: 'Number of flips (log scale)', min: 0, max: 37, step: 1, format: (v) => String(Math.round(10 ** (v / 10))) },
    { key: 'p', label: 'P(heads) in %', min: 10, max: 90, step: 10 },
    { key: 'runs', label: 'Runs', min: 1, max: 5, step: 1 },
    { readout: [
      ['Flips n', (s) => String(flips(s))],
      ['Share, run 1', (s) => fixed(runsFor(s.p)[0][flips(s) - 1], 3)],
      ['Gap from p', (s) => fixed(Math.abs(runsFor(s.p)[0][flips(s) - 1] - s.p / 100), 3)],
      ['Swing about 1/√n', (s) => fixed(1 / Math.sqrt(flips(s)), 3)],
    ] },
  ],
  tex: (s) => `\\dfrac{\\text{heads}}{n}\\to p=${fixed(s.p / 100, 1)}\\quad(n=${flips(s)})`,
});
