import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { NONNEG, best, vertices } from './_sm-math.js';
import { boundary, objectiveLine, shadeRegion } from './_lp-view.js';

// One unit of food 1 gives 3 units of vitamin A and 1 of vitamin B. One unit of food 2 gives 1 of A and 2 of B.
const state = { na: 12, nb: 10, c1: 4, c2: 3 };
const cons = (s) => [{ a: 3, b: 1, c: s.na, op: '>=' }, { a: 1, b: 2, c: s.nb, op: '>=' }, ...NONNEG];
const cost = (s, p) => s.c1 * p[0] + s.c2 * p[1];
const diet = (s) => best(vertices(cons(s)), (p) => cost(s, p), false);
const BOX = [0, 0, 14, 14];

createTool({
  state,
  label: 'The mixes of two foods that meet the daily vitamin needs, drawn as the unbounded shaded region above two lines, in the plane of units of food 1 and food 2. The cost line slides inward from far away until it first touches the region, and the corner it touches is the cheapest diet.',
  setup: (stage, c) => createPlot(stage, { x: [0, 14], y: [0, 14], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'units of food 1', yLabel: 'units of food 2' });
    shadeRegion(ctx, plot, cons(state), BOX, { fill: c.fillC, stroke: c.ink, width: 3 });
    cons(state).slice(0, 2).forEach((k, i) => boundary(plot, k, BOX, { color: i ? c.b : c.a, width: 3 }));
    const p = diet(state);
    objectiveLine(plot, state.c1, state.c2, cost(state, p), BOX, { color: c.d, width: 4, dash: [8, 5] });
    vertices(cons(state)).forEach((v) => dot(ctx, ...plot.toPx(...v), v === p ? 10 : 6, v === p ? c.fillY : c.fillA, c.ink));
  },
  controls: [
    { title: 'Plan the cheapest diet' },
    { key: 'na', label: 'Vitamin A needed', min: 4, max: 30, step: 2, format: (n) => `${n}` },
    { key: 'nb', label: 'Vitamin B needed', min: 4, max: 30, step: 2, format: (n) => `${n}` },
    { key: 'c1', label: 'Cost of food 1', min: 1, max: 10, step: 1, format: (n) => `₹${n}` },
    { key: 'c2', label: 'Cost of food 2', min: 1, max: 10, step: 1, format: (n) => `₹${n}` },
    { readout: [
      ['Cheapest mix (food 1, food 2)', (s) => `${fixed(diet(s)[0], 2)}, ${fixed(diet(s)[1], 2)}`],
      ['Lowest cost', (s) => ({ text: `₹${fixed(cost(s, diet(s)), 2)}`, good: true })],
      ['Vitamin A, vitamin B supplied', (s) => `${fixed(3 * diet(s)[0] + diet(s)[1], 2)}, ${fixed(diet(s)[0] + 2 * diet(s)[1], 2)}`],
    ] },
  ],
  tex: (s) => `\\min\\ ${s.c1}x+${s.c2}y\\ \\text{ subject to }\\ 3x+y\\ge${s.na},\\ x+2y\\ge${s.nb},\\ x,y\\ge0`,
});
