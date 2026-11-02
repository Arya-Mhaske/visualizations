import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { bmat, mul2, rad, rot2 } from '../linear-algebra/_la-math.js';
import { IDENTITY, SQUARE, plane, shape } from '../linear-algebra/_la-view.js';

// R turns by θ and S shears by k. "Rotate, then shear" is S R; "shear, then rotate" is R S.
const state = { theta: 50, k: 1 };
const R = (s) => rot2(rad(s.theta));
const S = (s) => [[1, s.k], [0, 1]];
const SR = (s) => mul2(S(s), R(s));
const RS = (s) => mul2(R(s), S(s));
const apart = (s) => Math.hypot(...SR(s).flat().map((v, i) => v - RS(s).flat()[i]));

createTool({
  state,
  label: 'A unit square with a corner marked. In blue, the square is rotated first and then sheared. In coral, it is sheared first and then rotated. The two results are different shapes in different places, so the order of two matrices matters: AB is not BA.',
  setup: (stage, c) => plane(stage, c, 3),
  draw(ctx, stage, c, plot) {
    plot.axes({ grid: true });
    shape(ctx, plot, SQUARE, IDENTITY, { stroke: c.grid, width: 2 });
    shape(ctx, plot, SQUARE, SR(state), { fill: c.fillB, stroke: c.ink });
    shape(ctx, plot, SQUARE, RS(state), { fill: c.fillA, stroke: c.ink });
    shape(ctx, plot, [[0, 0], [0.3, 0], [0.3, 0.3], [0, 0.3]], SR(state), { fill: c.b, stroke: c.ink, width: 2 });
    shape(ctx, plot, [[0, 0], [0.3, 0], [0.3, 0.3], [0, 0.3]], RS(state), { fill: c.a, stroke: c.ink, width: 2 });
  },
  controls: [
    { title: 'Two moves, two orders' },
    { key: 'theta', label: 'Rotate by', min: 0, max: 180, step: 10, format: (n) => `${n}°` },
    { key: 'k', label: 'Shear by', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Rotate, then shear (blue)', (s) => SR(s).flat().map((v) => fixed(v, 2)).join(', ')],
      ['Shear, then rotate (coral)', (s) => RS(s).flat().map((v) => fixed(v, 2)).join(', ')],
      ['Distance between the matrices', (s) => ({ text: fixed(apart(s), 3), good: apart(s) < 1e-9 })],
      ['Same result?', (s) => (apart(s) < 1e-9 ? 'yes (they commute here)' : 'no')],
    ] },
  ],
  tex: (s) => `S R=${bmat(SR(s), (v) => fixed(v, 2))}\\ \\ \\ne\\ \\ R S=${bmat(RS(s), (v) => fixed(v, 2))}`,
});
