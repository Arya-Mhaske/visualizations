import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sci } from '../../lib/format.js';

const state = { k: 1 };
const n = (s) => Math.round(10 ** s.k);
const u = (s) => 1 / n(s);
const g = (t) => Math.log(1 + t) / t;

createTool({
  state,
  label: 'The graph of ln of 1 plus u, divided by u, for u between 0 and 1. This is the log of one plus one over n to the n, with u equal to one over n. As u shrinks the graph rises to 1, which is what l Hopital gives: the ratio of the slopes 1 over 1 plus u, and 1. Exponentiating gives e.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [0.4, 1.1], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'u = 1/n', yLabel: 'ln(1+u)/u' });
    plot.segment(0, 1, 1, 1, { color: c.c, width: 3, dash: [8, 5] });
    plot.fn(g, { color: c.a, width: 4, domain: [0.002, 1] });
    plot.point(Math.max(u(state), 0.002), g(Math.max(u(state), 0.002)), { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Let n grow' },
    { key: 'k', label: 'n = 10 to the power k', min: 0, max: 6, step: 0.5, format: (v) => `n = ${Math.round(10 ** v)}` },
    { readout: [
      ['ln of the expression', (s) => fixed(n(s) * Math.log(1 + 1 / n(s)), 6)],
      ['Slope ratio, limit', () => '1 ÷ 1 = 1'],
      ['(1 + 1/n)ⁿ', (s) => fixed((1 + 1 / n(s)) ** n(s), 6)],
      ['e', () => fixed(Math.E, 6)],
    ] },
  ],
  tex: (s) => `\\ln\\left(1+\\tfrac1n\\right)^n=\\dfrac{\\ln(1+u)}{u}\\xrightarrow{\\text{l'H}}\\dfrac{1/(1+u)}{1}\\to1\\ \\Rightarrow\\ \\left(1+\\tfrac1n\\right)^n\\to e`,
});
void sci;
