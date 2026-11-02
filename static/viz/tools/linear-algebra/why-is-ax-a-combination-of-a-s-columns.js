import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { apply2, bmat, vecTex } from './_la-math.js';
import { plane, vec } from './_la-view.js';

const state = { a: 2, c: 1, b: -1, d: 2, x1: 1.5, x2: 1 };
const M = (s) => [[s.a, s.b], [s.c, s.d]];

createTool({
  state,
  label: 'The two columns of a matrix A drawn as arrows. Ax is built by going x1 times along column 1 and then x2 times along column 2. The result is the same as multiplying each row of A by x.',
  setup: (stage, c) => plane(stage, c, 6),
  draw(ctx, stage, c, plot) {
    const A = M(state);
    const col1 = [state.a, state.c];
    const col2 = [state.b, state.d];
    const first = col1.map((x) => x * state.x1);
    const second = col2.map((x) => x * state.x2);
    plot.axes();
    vec(ctx, plot, c, [0, 0], col1, { color: c.a, width: 3, text: 'col 1' });
    vec(ctx, plot, c, [0, 0], col2, { color: c.b, width: 3, text: 'col 2' });
    plot.segment(first[0], first[1], first[0] + second[0], first[1] + second[1], { color: c.grid, width: 2, dash: [5, 4] });
    plot.segment(second[0], second[1], first[0] + second[0], first[1] + second[1], { color: c.grid, width: 2, dash: [5, 4] });
    vec(ctx, plot, c, [0, 0], first, { color: c.a, width: 6 });
    vec(ctx, plot, c, first, [first[0] + second[0], first[1] + second[1]], { color: c.b, width: 6 });
    vec(ctx, plot, c, [0, 0], apply2(A, [state.x1, state.x2]), { color: c.c, width: 5, text: 'Ax' });
  },
  controls: [
    { title: 'Combine the columns' },
    { key: 'x1', label: 'x₁ (how much column 1)', min: -2, max: 2, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'x2', label: 'x₂ (how much column 2)', min: -2, max: 2, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'a', label: 'Column 1, top', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'c', label: 'Column 1, bottom', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'b', label: 'Column 2, top', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'd', label: 'Column 2, bottom', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { readout: [
      ['x₁ × col 1 + x₂ × col 2', (s) => `(${fixed(s.x1 * s.a + s.x2 * s.b, 2)}, ${fixed(s.x1 * s.c + s.x2 * s.d, 2)})`],
      ['Rows times x', (s) => `(${fixed(apply2(M(s), [s.x1, s.x2])[0], 2)}, ${fixed(apply2(M(s), [s.x1, s.x2])[1], 2)})`],
    ] },
  ],
  tex: (s) => `${bmat(M(s))}${vecTex([s.x1, s.x2], (x) => fixed(x, 2))}=${fixed(s.x1, 2)}${vecTex([s.a, s.c])}+${fixed(s.x2, 2)}${vecTex([s.b, s.d])}=${vecTex(apply2(M(s), [s.x1, s.x2]), (x) => fixed(x, 2))}`,
});
