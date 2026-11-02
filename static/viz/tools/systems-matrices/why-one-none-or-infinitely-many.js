import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { classify2 } from './_sm-math.js';
import { plane } from '../linear-algebra/_la-view.js';

// y = m1 x + k1 and y = m2 x + k2, written as −m x + y = k.
const state = { m1: 1, k1: 1, m2: -1, k2: 3 };
const result = (s) => classify2(-s.m1, 1, s.k1, -s.m2, 1, s.k2);
const elimination = (s) => {
  const dm = s.m1 - s.m2;
  const dk = s.k2 - s.k1;
  if (Math.abs(dm) > 1e-9) return `(${fixed(dm, 2)})x = ${fixed(dk, 2)}`;
  return Math.abs(dk) < 1e-9 ? '0 = 0' : `0 = ${fixed(dk, 2)}`;
};

createTool({
  state,
  label: 'Two straight lines whose slopes and intercepts you can change. If the slopes differ the lines cross at exactly one point, the solution. If the slopes are equal and the intercepts differ the lines are parallel and there is no solution. If both are equal the lines are the same line and every point on it is a solution. The elimination line below shows what the algebra says in each case.',
  setup: (stage, c) => plane(stage, c, 6),
  draw(ctx, stage, c, plot) {
    const r = result(state);
    plot.axes();
    plot.fn((x) => state.m1 * x + state.k1, { color: c.a, width: r.kind === 'many' ? 8 : 4, domain: [-8, 8] });
    plot.fn((x) => state.m2 * x + state.k2, { color: c.b, width: 4, domain: [-8, 8] });
    if (r.kind === 'one') plot.point(r.x, r.y, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Move the two lines' },
    { key: 'm1', label: 'Line 1: slope', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'k1', label: 'Line 1: intercept', min: -5, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'm2', label: 'Line 2: slope', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'k2', label: 'Line 2: intercept', min: -5, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Number of solutions', (s) => { const r = result(s); return { text: r.kind === 'one' ? '1' : r.kind === 'none' ? '0' : '∞', good: r.kind === 'one' }; }],
      ['Subtract the equations', (s) => elimination(s)],
      ['Solution', (s) => { const r = result(s); return r.kind === 'one' ? `(${fixed(r.x, 3)}, ${fixed(r.y, 3)})` : r.kind === 'none' ? 'none' : 'every point of the line'; }],
      ['Determinant of the coefficients', (s) => fixed(result(s).det, 2)],
    ] },
  ],
  tex: (s) => `y=${fixed(s.m1, 1)}x+${fixed(s.k1, 1)},\\quad y=${fixed(s.m2, 1)}x+${fixed(s.k2, 1)}\\ \\Rightarrow\\ ${elimination(s).replace(/ /g, '\\ ')}`,
});
