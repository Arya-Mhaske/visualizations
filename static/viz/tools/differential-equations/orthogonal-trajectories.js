import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { direction } from '../../lib/graph.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';
import { fixed } from '../../lib/format.js';
import { FAMILIES } from './_separable-math.js';

// If the first family has slope s1(x, y), the curves that cross it at right angles have slope −1/s1.
// Separating that new equation gives the second family. Here both are drawn and a pair crosses at P.
const state = { fam: 'parabolas', x: 1.5, y: 1, ghosts: true };
const HALF = 4;
const segs = (g, k) => contour((x, y) => g(x, y, k), -HALF, HALF, 100);

createTool({
  state,
  label: 'Two families of curves that cross each other at right angles, drawn on one set of axes. A chosen point P lies on one curve from each family, and their tangents at P are drawn. Their slopes multiply to minus one.',
  setup: (stage, c) => createPlot(stage, { x: [-HALF, HALF], y: [-HALF, HALF], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    const f = FAMILIES[state.fam];
    const { x, y } = state;
    plot.axes({ grid: false });
    if (state.ghosts) {
      for (const k of f.list1) for (const [a, b] of segs(f.g1, k)) plot.segment(a[0], a[1], b[0], b[1], { color: c.grid, width: 2 });
      for (const k of f.list2) for (const [a, b] of segs(f.g2, k)) plot.segment(a[0], a[1], b[0], b[1], { color: c.grid, width: 2 });
    }
    for (const [a, b] of segs(f.g1, f.c(x, y))) plot.segment(a[0], a[1], b[0], b[1], { color: c.a, width: 4 });
    for (const [a, b] of segs(f.g2, f.k(x, y))) plot.segment(a[0], a[1], b[0], b[1], { color: c.b, width: 4 });
    for (const m of [f.s1(x, y), f.s2(x, y)]) direction(plot, x, y, 1, m, 0.9 / Math.max(1, Math.abs(m)), { color: c.ink, width: 3 });
    plot.point(x, y, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Two families that cross at right angles' },
    { key: 'fam', label: 'Families', options: Object.entries(FAMILIES).map(([key, v]) => [key, v.name]) },
    { key: 'x', label: 'Point x', min: 0.5, max: 3, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'y', label: 'Point y', min: 0.5, max: 3, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'ghosts', label: 'Show more curves of each family', toggle: true },
    { readout: [
      ['Slope of the first curve', (s) => fixed(FAMILIES[s.fam].s1(s.x, s.y), 3)],
      ['Slope of the second curve', (s) => fixed(FAMILIES[s.fam].s2(s.x, s.y), 3)],
      ['Product', (s) => ({ text: fixed(FAMILIES[s.fam].s1(s.x, s.y) * FAMILIES[s.fam].s2(s.x, s.y), 3), good: true })],
    ] },
  ],
  tex: (s) => `m_1\\,m_2=(${fixed(FAMILIES[s.fam].s1(s.x, s.y), 2)})(${fixed(FAMILIES[s.fam].s2(s.x, s.y), 2)})=${fixed(FAMILIES[s.fam].s1(s.x, s.y) * FAMILIES[s.fam].s2(s.x, s.y), 2)}`,
});
