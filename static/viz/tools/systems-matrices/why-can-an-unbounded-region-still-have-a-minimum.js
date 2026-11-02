import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { NONNEG, best, improvesForever, vertices } from './_sm-math.js';
import { objectiveLine, shadeRegion } from './_lp-view.js';

const BOX = [0, 0, 10, 10];
const CONS = [{ a: 1, b: 1, c: 4, op: '>=' }, { a: 1, b: 3, c: 6, op: '>=' }, ...NONNEG];
const VERTS = vertices(CONS);
const GOALS = {
  min1: { name: 'Minimise 3x + 2y', a: 3, b: 2, maximise: false },
  min2: { name: 'Minimise x − y', a: 1, b: -1, maximise: false },
  max1: { name: 'Maximise 3x + 2y', a: 3, b: 2, maximise: true },
};
const state = { goal: 'min1', k: 20 };
const goal = (s) => GOALS[s.goal];
const f = (s) => ([x, y]) => goal(s).a * x + goal(s).b * y;
const endless = (s) => improvesForever(CONS, f(s), goal(s).maximise);
const bestCorner = (s) => best(VERTS, f(s), goal(s).maximise);
// Does the side of the line Z = k that we want to improve into meet the region?
const meets = (s) => endless(s) || VERTS.some((p) => (goal(s).maximise ? f(s)(p) > s.k + 1e-9 : f(s)(p) < s.k - 1e-9));

createTool({
  state,
  label: 'An unbounded feasible region reaching up and to the right, drawn clipped by the window, and an objective line Z equals k that you can move. For a minimum, the question is whether the half plane of smaller values still meets the region. When the objective grows in every direction the region reaches, the line eventually stops meeting the lower half plane and there is a minimum at a corner. When some direction of the region lets Z keep falling, no minimum exists.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 10], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    const g = goal(state);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    shadeRegion(ctx, plot, CONS, BOX, { fill: c.fillC, stroke: c.ink, width: 3 });
    objectiveLine(plot, g.a, g.b, state.k, BOX, { color: c.a, width: 4 });
    VERTS.forEach((p) => dot(ctx, ...plot.toPx(...p), 6, c.fillA, c.ink));
    if (!endless(state)) { const b = bestCorner(state); dot(ctx, ...plot.toPx(...b), 10, c.fillY, c.ink); }
  },
  controls: [
    { title: 'Slide Z = k' },
    { key: 'goal', label: 'Goal', options: Object.entries(GOALS).map(([key, v]) => [key, v.name]) },
    { key: 'k', label: 'The line Z = k', min: -10, max: 40, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Corner values of Z', (s) => VERTS.map((p) => fixed(f(s)(p), 1)).join(', ')],
      ['Does it keep improving without limit?', (s) => ({ text: endless(s) ? 'yes: no optimum' : 'no', good: !endless(s) })],
      ['Optimum', (s) => (endless(s) ? 'does not exist' : `${fixed(f(s)(bestCorner(s)), 2)} at (${fixed(bestCorner(s)[0], 2)}, ${fixed(bestCorner(s)[1], 2)})`)],
      ['Better side of the line meets the region?', (s) => ({ text: meets(s) ? 'yes' : 'no', good: !meets(s) })],
    ] },
  ],
  tex: (s) => `Z=${goal(s).a}x${goal(s).b < 0 ? '-' : '+'}${Math.abs(goal(s).b)}y=${fixed(s.k, 1)}`,
});
