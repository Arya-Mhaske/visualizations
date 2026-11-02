import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { classify2 } from './_sm-math.js';
import { IDENTITY, plane, shape, vec } from '../linear-algebra/_la-view.js';

// Columns a1 = (a, c) and a2 = (b, d), right side b = (e, f). b = x1 a1 + x2 a2. Replace a1 by b: the parallelogram on (b, a2) has x1 times the area of the one on (a1, a2).
const state = { a: 2, c: 1, b: 1, d: 3, e: 3, f: 5 };
const area = (u, v) => u[0] * v[1] - u[1] * v[0];
const a1 = (s) => [s.a, s.c];
const a2 = (s) => [s.b, s.d];
const rhs = (s) => [s.e, s.f];
const para = (u, v) => [[0, 0], u, [u[0] + v[0], u[1] + v[1]], v];
const sol = (s) => classify2(s.a, s.b, s.e, s.c, s.d, s.f);

createTool({
  state,
  label: 'The parallelogram on the two columns of a matrix, in grey, and the parallelogram made by swapping the first column for the right-hand side b, in colour. Because b is x1 times column 1 plus x2 times column 2, the second column part adds no area, and the new parallelogram has exactly x1 times the old area. So x1 is the ratio of the two areas, which is Cramer\'s rule.',
  setup: (stage, c) => plane(stage, c, 7),
  draw(ctx, stage, c, plot) {
    plot.axes();
    shape(ctx, plot, para(a1(state), a2(state)), IDENTITY, { fill: c.fillB, stroke: c.ink, width: 2 });
    shape(ctx, plot, para(rhs(state), a2(state)), IDENTITY, { stroke: c.a, width: 4 });
    vec(ctx, plot, c, [0, 0], a1(state), { color: c.b, width: 4, text: 'col 1' });
    vec(ctx, plot, c, [0, 0], a2(state), { color: c.d, width: 4, text: 'col 2' });
    vec(ctx, plot, c, [0, 0], rhs(state), { color: c.a, width: 5, text: 'b' });
  },
  controls: [
    { title: 'Swap column 1 for b' },
    { key: 'a', label: 'Column 1, top', min: -3, max: 4, step: 1, format: (n) => `${n}` },
    { key: 'c', label: 'Column 1, bottom', min: -3, max: 4, step: 1, format: (n) => `${n}` },
    { key: 'b', label: 'Column 2, top', min: -3, max: 4, step: 1, format: (n) => `${n}` },
    { key: 'd', label: 'Column 2, bottom', min: -3, max: 4, step: 1, format: (n) => `${n}` },
    { key: 'e', label: 'b, top', min: -5, max: 6, step: 1, format: (n) => `${n}` },
    { key: 'f', label: 'b, bottom', min: -5, max: 6, step: 1, format: (n) => `${n}` },
    { readout: [
      ['det A (grey area)', (s) => fixed(area(a1(s), a2(s)), 2)],
      ['det of [b col 2] (coloured area)', (s) => fixed(area(rhs(s), a2(s)), 2)],
      ['Ratio = x₁', (s) => (Math.abs(area(a1(s), a2(s))) < 1e-9 ? 'det A = 0: no ratio' : { text: fixed(area(rhs(s), a2(s)) / area(a1(s), a2(s)), 3), good: true })],
      ['x₁ from solving', (s) => (sol(s).kind === 'one' ? fixed(sol(s).x, 3) : '—')],
    ] },
  ],
  tex: (s) => `x_1=\\dfrac{\\det[\\,\\mathbf b\\ \\ \\mathbf a_2\\,]}{\\det[\\,\\mathbf a_1\\ \\ \\mathbf a_2\\,]}=\\dfrac{${fixed(area(rhs(s), a2(s)), 2)}}{${fixed(area(a1(s), a2(s)), 2)}}`,
});
