import { createTool } from '../../lib/tool.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { apply2, det2, nullBasis } from '../linear-algebra/_la-math.js';
import { IDENTITY, SQUARE, gridUnder, plane, shape } from '../linear-algebra/_la-view.js';

const state = { a: 2, c: 1, b: 1, d: 2, px: 1, py: 0.5 };
const M = (s) => [[s.a, s.b], [s.c, s.d]];
const flat = (s) => Math.abs(det2(M(s))) < 1e-9;
const partner = (s) => { const n = nullBasis(M(s))[0]; return n ? [s.px + n[0], s.py + n[1]] : null; };

const tool = createTool({
  state,
  label: 'The grid of the plane and its image under a matrix. When the columns point in different directions, the grid is turned into a slanted grid that still covers the whole plane. When one column is a multiple of the other, the whole plane is squashed onto a single line. Then two different points land on the same spot, and no inverse could say which one it came from.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    const A = M(state);
    plot.axes({ grid: false });
    gridUnder(ctx, plot, IDENTITY, { color: c.grid, half: 5, width: 1 });
    gridUnder(ctx, plot, A, { color: c.b, half: 5, width: 1.5 });
    shape(ctx, plot, SQUARE, A, { fill: c.fillB, stroke: c.ink, width: 3 });
    const p = [state.px, state.py];
    const out = apply2(A, p);
    dot(ctx, ...plot.toPx(...p), 7, c.fillA, c.ink);
    dot(ctx, ...plot.toPx(...out), 7, c.fillY, c.ink);
    if (flat(state) && partner(state)) {
      const q = partner(state);
      dot(ctx, ...plot.toPx(...q), 7, c.fillC, c.ink);
      plot.segment(p[0], p[1], q[0], q[1], { color: c.grid, width: 2, dash: [4, 4] });
    }
  },
  controls: (t) => [
    { title: 'Squash the plane' },
    { key: 'a', label: 'Column 1, top', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'c', label: 'Column 1, bottom', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'Column 2, top', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'd', label: 'Column 2, bottom', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'px', label: 'Point: x', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'py', label: 'Point: y', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { row: [{ button: 'Make column 2 = 2 × column 1', onClick() { state.b = 2 * state.a; state.d = 2 * state.c; t.update(); } }] },
    { readout: [
      ['det A', (s) => fixed(det2(M(s)), 2)],
      ['Image of the point', (s) => `(${fixed(apply2(M(s), [s.px, s.py])[0], 2)}, ${fixed(apply2(M(s), [s.px, s.py])[1], 2)})`],
      ['Another point with the same image', (s) => (flat(s) && partner(s) ? `(${fixed(partner(s)[0], 2)}, ${fixed(partner(s)[1], 2)})` : 'none')],
      ['Inverse exists?', (s) => ({ text: flat(s) ? 'no' : 'yes', good: !flat(s) })],
    ] },
  ],
  tex: (s) => (flat(s) ? '\\det A=0:\\ \\text{two points share one image, so}\\ A^{-1}\\ \\text{cannot exist}' : `\\det A=${fixed(det2(M(s)), 2)}\\ne0:\\ \\text{every point has its own image}`),
});
void tool;
