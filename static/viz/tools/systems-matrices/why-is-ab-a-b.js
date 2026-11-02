import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { bmat, mul2 } from '../linear-algebra/_la-math.js';
import { det2 } from './_sm-math.js';
import { SQUARE, plane, shape } from '../linear-algebra/_la-view.js';

const BS = {
  stretch: { name: 'Stretch x by 2', B: [[2, 0], [0, 1]] },
  shear: { name: 'Shear', B: [[1, 1], [0, 1]] },
  rotate: { name: 'Rotate and scale', B: [[1.2, -0.9], [0.9, 1.2]] },
  flip: { name: 'Reflect', B: [[0, 1], [1, 0]] },
};
const state = { which: 'stretch', a: 1, c: 0.5, b: 0, d: 1.5 };
const A = (s) => [[s.a, s.b], [s.c, s.d]];
const B = (s) => BS[s.which].B;

createTool({
  state,
  label: 'The unit square first moved by B, drawn as a blue outline, and then moved by A, drawn filled. B multiplies every area by the determinant of B. A then multiplies every area by the determinant of A. So the two moves together multiply areas by the product of the two determinants, and that is the determinant of AB.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    plot.axes({ grid: false });
    shape(ctx, plot, SQUARE, [[1, 0], [0, 1]], { stroke: c.grid, width: 2 });
    shape(ctx, plot, SQUARE, B(state), { stroke: c.b, width: 3 });
    const AB = mul2(A(state), B(state));
    shape(ctx, plot, SQUARE, AB, { fill: det2(AB) >= 0 ? c.fillC : c.fillA, stroke: c.ink });
  },
  controls: [
    { title: 'Two area scalings in a row' },
    { key: 'which', label: 'B (first)', options: Object.entries(BS).map(([key, v]) => [key, v.name]) },
    { key: 'a', label: 'A: column 1, top', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'c', label: 'A: column 1, bottom', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'A: column 2, top', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'd', label: 'A: column 2, bottom', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['|B| (area after B)', (s) => fixed(det2(B(s)), 3)],
      ['|A|', (s) => fixed(det2(A(s)), 3)],
      ['|A| × |B|', (s) => fixed(det2(A(s)) * det2(B(s)), 3)],
      ['|AB|, measured on the product', (s) => ({ text: fixed(det2(mul2(A(s), B(s))), 3), good: true })],
    ] },
  ],
  tex: (s) => `|AB|=\\left|${bmat(mul2(A(s), B(s)), (v) => fixed(v, 2))}\\right|=${fixed(det2(mul2(A(s), B(s))), 3)}=(${fixed(det2(A(s)), 2)})(${fixed(det2(B(s)), 2)})`,
});
