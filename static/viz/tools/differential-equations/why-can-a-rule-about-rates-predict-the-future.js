import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { direction } from '../../lib/graph.js';
import { euler } from './_de-math.js';
import { fixed } from '../../lib/format.js';

// Three rate rules y' = f(y) with their exact solutions (for the "true future" curve) and a window.
const RULES = {
  growth: { name: 'Growth: y′ = 0.4y', f: (y) => 0.4 * y, exact: (y0, t) => y0 * Math.exp(0.4 * t), top: 40, tex: "y'=0.4\\,y" },
  decay: { name: 'Cooling: y′ = −0.5y', f: (y) => -0.5 * y, exact: (y0, t) => y0 * Math.exp(-0.5 * t), top: 6, tex: "y'=-0.5\\,y" },
  fill: { name: 'Filling: y′ = 3 − 0.5y', f: (y) => 3 - 0.5 * y, exact: (y0, t) => 6 + (y0 - 6) * Math.exp(-0.5 * t), top: 8, tex: "y'=3-0.5\\,y" },
};
const DT = 0.5;
const state = { rule: 'growth', y0: 2, n: 5, truth: false };

createTool({
  state,
  label: 'A rule that gives the rate of change from the present value. Starting from a chosen present value, each step reads the rate from the rule, draws a short straight piece with that slope, and arrives at the next value. Taking more steps predicts further into the future. A switch shows the true curve for comparison.',
  setup: (stage, c) => createPlot(stage, { x: [0, 5.2], y: [0, 40], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    const rule = RULES[state.rule];
    plot.setRange([0, 5.2], [0, rule.top]);
    plot.axes({ xLabel: 'time', yLabel: 'y' });
    if (state.truth) plot.fn((t) => rule.exact(state.y0, t), { color: c.grid, width: 4, domain: [0, 5] });
    const path = euler((x, y) => rule.f(y), 0, state.y0, DT, state.n);
    for (let i = 0; i < path.length - 1; i++) {
      plot.segment(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], { color: c.a, width: 4 });
    }
    path.forEach(([t, y], i) => {
      if (i < path.length - 1) direction(plot, t, y, 1, rule.f(y), 0.2, { color: c.ink, width: 2 });
      plot.point(t, y, { fill: i === path.length - 1 ? c.fillY : c.fillA, r: i === path.length - 1 ? 8 : 4 });
    });
  },
  controls: [
    { title: 'Step into the future' },
    { key: 'rule', label: 'Rule', options: Object.entries(RULES).map(([key, v]) => [key, v.name]) },
    { key: 'y0', label: 'Present value y(0)', min: 0, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'n', label: 'Steps taken (each 0.5 long)', min: 0, max: 10, step: 1, format: (n) => `${n}` },
    { key: 'truth', label: 'Show the true curve', toggle: true },
    { readout: [
      ['Time reached', (s) => fixed(s.n * DT, 1)],
      ['Predicted value', (s) => fixed(euler((x, y) => RULES[s.rule].f(y), 0, s.y0, DT, s.n).at(-1)[1], 3)],
      ['Rate there', (s) => fixed(RULES[s.rule].f(euler((x, y) => RULES[s.rule].f(y), 0, s.y0, DT, s.n).at(-1)[1]), 3)],
    ] },
  ],
  tex: (s) => `${RULES[s.rule].tex},\\ y(0)=${fixed(s.y0, 1)}\\ \\Rightarrow\\ y_{\\text{next}}=y+\\left(\\text{rate}\\right)\\times0.5`,
});
