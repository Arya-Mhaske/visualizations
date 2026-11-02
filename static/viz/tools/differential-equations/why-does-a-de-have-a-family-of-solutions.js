import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { deriv, slopeTicks, tangent } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

// Each rule dy/dx = r(x, y) has the solutions y = sol(x, C), and y(0) = C in every case.
const RULES = {
  same: { name: "y′ = y", r: (x, y) => y, sol: (x, C) => C * Math.exp(x), gen: (C) => `y=${C}e^{x}` },
  parab: { name: "y′ = 2x", r: (x) => 2 * x, sol: (x, C) => x * x + C, gen: (C) => `y=x^2+(${C})` },
  wave: { name: "y′ = cos x", r: (x) => Math.cos(x), sol: (x, C) => Math.sin(x) + C, gen: (C) => `y=\\sin x+(${C})` },
};
const state = { rule: 'parab', C: 1, x: 1, ticks: true };
const SHOW = [-3, -2, -1, 0, 1, 2, 3];

createTool({
  state,
  label: 'A rule for the slope drawn as short slope marks all over the plane. Many different curves follow those marks, one for each value of the constant C. Choosing the starting value y of 0 picks out exactly one of them. A tangent at a chosen x shows that the curve slope matches the rule.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 3], y: [-4, 4], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const rule = RULES[state.rule];
    plot.axes();
    if (state.ticks) slopeTicks(ctx, plot, rule.r, [-3, 3], [-4, 4], 14, 11, { len: 12, color: c.grid, width: 2 });
    for (const C of SHOW) plot.fn((x) => rule.sol(x, C), { color: c.grid, width: 2 });
    const f = (x) => rule.sol(x, state.C);
    plot.fn(f, { color: c.a, width: 5 });
    tangent(plot, state.x, f(state.x), rule.r(state.x, f(state.x)), 0.7, { color: c.ink, width: 3 });
    plot.point(0, state.C, { fill: c.fillB, r: 6 });
    plot.point(state.x, f(state.x), { fill: c.fillY });
  },
  controls: [
    { title: 'One rule, many curves' },
    { key: 'rule', label: 'Rule', options: Object.entries(RULES).map(([key, v]) => [key, v.name]) },
    { key: 'C', label: 'Starting value y(0)', min: -3, max: 3, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'x', label: 'Look at x', min: -2.5, max: 2.5, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'ticks', label: 'Show the slope marks', toggle: true },
    { readout: [
      ['Rule says slope', (s) => fixed(RULES[s.rule].r(s.x, RULES[s.rule].sol(s.x, s.C)), 3)],
      ['Curve slope (measured)', (s) => fixed(deriv((t) => RULES[s.rule].sol(t, s.C), s.x), 3)],
    ] },
  ],
  tex: (s) => `${RULES[s.rule].gen(fixed(s.C, 2))}\\ \\text{solves}\\ \\ ${RULES[s.rule].name.replace('′', "'")}`,
});
