import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { NONNEG, best, vertices } from './_sm-math.js';
import { objectiveLine, shadeRegion } from './_lp-view.js';

const BOX = [0, 0, 8, 8];
const CONS = [{ a: 2, b: 1, c: 12, op: '<=' }, { a: 1, b: 2, c: 10, op: '<=' }, ...NONNEG];
const VERTS = vertices(CONS);
const state = { a: 3, b: 2, z: 10 };
const Z = (s, p) => s.a * p[0] + s.b * p[1];
const top = (s) => best(VERTS, (p) => Z(s, p), true);

createTool({
  state,
  label: 'A feasible region with four corners, and a profit line a x plus b y equals z that slides across it as z grows. Every point of the line has the same profit. As the line is pushed outward it keeps touching the region until it reaches a last point, and that last point is always a corner.',
  setup: (stage, c) => createPlot(stage, { x: [0, 8], y: [0, 8], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    shadeRegion(ctx, plot, CONS, BOX, { fill: c.fillC, stroke: c.ink, width: 3 });
    if (state.a !== 0 || state.b !== 0) objectiveLine(plot, state.a, state.b, state.z, BOX, { color: c.a, width: 4 });
    const t = top(state);
    VERTS.forEach((p) => dot(ctx, ...plot.toPx(...p), p === t ? 10 : 6, p === t ? c.fillY : c.fillA, c.ink));
  },
  controls: [
    { title: 'Slide the profit line' },
    { key: 'z', label: 'Profit z of the line', min: 0, max: 40, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'a', label: 'Profit per unit of x', min: 0, max: 6, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'Profit per unit of y', min: 0, max: 6, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Best corner', (s) => (s.a === 0 && s.b === 0 ? '—' : `(${fixed(top(s)[0], 2)}, ${fixed(top(s)[1], 2)})`)],
      ['Best profit', (s) => ({ text: fixed(Z(s, top(s)), 2), good: true })],
      ['Line still touches the region?', (s) => { const ok = VERTS.some((p) => Z(s, p) >= s.z - 1e-9) && VERTS.some((p) => Z(s, p) <= s.z + 1e-9); return ok ? 'yes' : 'no: it has left'; }],
      ['Profit at each corner', (s) => VERTS.map((p) => fixed(Z(s, p), 1)).join(', ')],
    ] },
  ],
  tex: (s) => `Z=${fixed(s.a, 1)}x+${fixed(s.b, 1)}y=${fixed(s.z, 1)}`,
});
