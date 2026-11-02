import { createTool } from '../../lib/tool.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { createPlot } from '../../lib/plot.js';
import { boundary, shadeRegion } from './_lp-view.js';

const BOX = [-6, -6, 6, 6];
const state = { a: 1, b: 2, c: 4, op: '<=', px: 1, py: 1 };
const k = (s) => ({ a: s.a, b: s.b, c: s.c, op: s.op });
const value = (s) => s.a * s.px + s.b * s.py;
const holds = (s) => (s.op === '<=' ? value(s) <= s.c + 1e-9 : value(s) >= s.c - 1e-9);

createTool({
  state,
  label: 'A straight line a x plus b y equals c, and a test point. The line splits the plane in two halves. Every point of one half makes the inequality true, and every point of the other half makes it false. The shaded half is the set of true points. The test point is green when it is in the shaded half and red when it is not.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-6, 6], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    shadeRegion(ctx, plot, [k(state)], BOX, { fill: c.fillC, stroke: null, width: 0 });
    boundary(plot, k(state), BOX, { color: c.ink, width: 4 });
    dot(ctx, ...plot.toPx(state.px, state.py), 9, holds(state) ? c.fillC : c.fillA, c.ink);
    dot(ctx, ...plot.toPx(0, 0), 4, c.ink, c.ink, 1);
  },
  controls: [
    { title: 'Test a point' },
    { key: 'px', label: 'Test point x', min: -5, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'py', label: 'Test point y', min: -5, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'op', label: 'Inequality', options: [['<=', 'ax + by ≤ c'], ['>=', 'ax + by ≥ c']] },
    { key: 'a', label: 'a', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'b', label: 'b', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'c', label: 'c', min: -8, max: 8, step: 1, format: (n) => `${n}` },
    { readout: [
      ['ax + by at the test point', (s) => fixed(value(s), 2)],
      ['Compared with c', (s) => ({ text: `${fixed(value(s), 2)} ${s.op === '<=' ? '≤' : '≥'} ${s.c}: ${holds(s) ? 'true' : 'false'}`, good: holds(s) })],
      ['Does the origin satisfy it?', (s) => (s.op === '<=' ? 0 <= s.c : 0 >= s.c) ? 'yes' : 'no'],
    ] },
  ],
  tex: (s) => `${s.a}x${s.b < 0 ? '-' : '+'}${Math.abs(s.b)}y\\ ${s.op === '<=' ? '\\le' : '\\ge'}\\ ${s.c}`,
});
