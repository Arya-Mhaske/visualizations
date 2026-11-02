import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { NONNEG, best, vertices } from './_sm-math.js';
import { boundary, objectiveLine, shadeRegion } from './_lp-view.js';

// Product A needs 2 h on machine 1 and 1 h on machine 2; product B needs 1 h on machine 1 and 2 h on machine 2.
const state = { m1: 12, m2: 10, pa: 300, pb: 200 };
const cons = (s) => [{ a: 2, b: 1, c: s.m1, op: '<=' }, { a: 1, b: 2, c: s.m2, op: '<=' }, ...NONNEG];
const profit = (s, p) => s.pa * p[0] + s.pb * p[1];
const plan = (s) => best(vertices(cons(s)), (p) => profit(s, p), true);
const box = (s) => { const t = Math.max(s.m1, s.m2) * 1.1; return [0, 0, t, t]; };

createTool({
  state,
  label: 'The production plans a factory can afford, drawn as a shaded region in the plane of the number of units of product A and product B. The two slanted edges are the machine hour limits. The profit line moves outward until it last touches the region, and that corner is the best plan.',
  setup: (stage, c) => createPlot(stage, { x: [0, 14], y: [0, 14], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    const b = box(state);
    plot.setRange([0, b[2]], [0, b[3]]);
    plot.axes({ xLabel: 'units of A', yLabel: 'units of B' });
    shadeRegion(ctx, plot, cons(state), b, { fill: c.fillC, stroke: c.ink, width: 3 });
    cons(state).slice(0, 2).forEach((k, i) => boundary(plot, k, b, { color: i ? c.b : c.a, width: 3 }));
    const p = plan(state);
    objectiveLine(plot, state.pa, state.pb, profit(state, p), b, { color: c.d, width: 4, dash: [8, 5] });
    vertices(cons(state)).forEach((v) => dot(ctx, ...plot.toPx(...v), v === p ? 10 : 6, v === p ? c.fillY : c.fillA, c.ink));
  },
  controls: [
    { title: 'Plan the production' },
    { key: 'm1', label: 'Machine 1 hours', min: 4, max: 14, step: 1, format: (n) => `${n} h` },
    { key: 'm2', label: 'Machine 2 hours', min: 4, max: 14, step: 1, format: (n) => `${n} h` },
    { key: 'pa', label: 'Profit per unit of A', min: 100, max: 500, step: 50, format: (n) => `₹${n}` },
    { key: 'pb', label: 'Profit per unit of B', min: 100, max: 500, step: 50, format: (n) => `₹${n}` },
    { readout: [
      ['Best plan (units of A, B)', (s) => `${fixed(plan(s)[0], 2)}, ${fixed(plan(s)[1], 2)}`],
      ['Best profit', (s) => ({ text: `₹${fixed(profit(s, plan(s)), 0)}`, good: true })],
      ['Machine 1 hours used', (s) => `${fixed(2 * plan(s)[0] + plan(s)[1], 2)} of ${s.m1}`],
      ['Machine 2 hours used', (s) => `${fixed(plan(s)[0] + 2 * plan(s)[1], 2)} of ${s.m2}`],
    ] },
  ],
  tex: (s) => `\\max\\ ${s.pa}x+${s.pb}y\\ \\text{ subject to }\\ 2x+y\\le${s.m1},\\ x+2y\\le${s.m2},\\ x,y\\ge0`,
});
