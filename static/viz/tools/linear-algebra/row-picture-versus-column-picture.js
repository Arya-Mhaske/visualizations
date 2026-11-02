import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { bmat, det2, solve, vecTex } from './_la-math.js';
import { plane, vec } from './_la-view.js';

// a x + b y = e (row 1), c x + d y = f (row 2). Same system, two pictures.
const state = { view: 'rows', a: 1, b: 2, c: 3, d: 1, e: 5, f: 5 };
const A = (s) => [[s.a, s.b], [s.c, s.d]];
const sol = (s) => (Math.abs(det2(A(s))) < 1e-9 ? null : solve(A(s), [s.e, s.f]));

createTool({
  state,
  label: 'One two-by-two system of equations drawn two ways. In the row picture each equation is a line and the solution is where the lines cross. In the column picture the two columns of the matrix are arrows, and the solution says how much of each column adds up to the right side b.',
  setup: (stage, c) => plane(stage, c, 6),
  draw(ctx, stage, c, plot) {
    const x = sol(state);
    plot.axes();
    if (state.view === 'rows') {
      const lineOf = (p, q, r, color) => {
        if (Math.abs(q) > 1e-9) plot.segment(-8, (r + 8 * p) / q, 8, (r - 8 * p) / q, { color, width: 4 });
        else if (Math.abs(p) > 1e-9) plot.segment(r / p, -8, r / p, 8, { color, width: 4 });
      };
      lineOf(state.a, state.b, state.e, c.a);
      lineOf(state.c, state.d, state.f, c.b);
      if (x) plot.point(x[0], x[1], { fill: c.fillY, r: 8 });
      return;
    }
    const col1 = [state.a, state.c];
    const col2 = [state.b, state.d];
    vec(ctx, plot, c, [0, 0], col1, { color: c.a, width: 4, text: 'col 1' });
    vec(ctx, plot, c, [0, 0], col2, { color: c.b, width: 4, text: 'col 2' });
    if (x) {
      const first = col1.map((v) => v * x[0]);
      vec(ctx, plot, c, [0, 0], first, { color: c.a, width: 7 });
      vec(ctx, plot, c, first, [first[0] + col2[0] * x[1], first[1] + col2[1] * x[1]], { color: c.b, width: 7 });
    }
    vec(ctx, plot, c, [0, 0], [state.e, state.f], { color: c.c, width: 5, text: 'b' });
  },
  controls: [
    { title: 'One system, two pictures' },
    { key: 'view', label: 'Picture', options: [['rows', 'Rows: lines cross'], ['cols', 'Columns: combine']] },
    { key: 'a', label: 'Row 1, x', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'b', label: 'Row 1, y', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'c', label: 'Row 2, x', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'd', label: 'Row 2, y', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'e', label: 'Right side, row 1', min: -6, max: 6, step: 1, format: (n) => `${n}` },
    { key: 'f', label: 'Right side, row 2', min: -6, max: 6, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Solution (x, y)', (s) => (sol(s) ? `(${fixed(sol(s)[0], 3)}, ${fixed(sol(s)[1], 3)})` : 'none, or many')],
      ['det A', (s) => fixed(det2(A(s)), 2)],
    ] },
  ],
  tex: (s) => `${bmat(A(s))}\\mathbf x=${vecTex([s.e, s.f])}${sol(s) ? `\\ \\Rightarrow\\ \\mathbf x=${vecTex(sol(s), (v) => fixed(v, 3))}` : '\\ \\Rightarrow\\ \\text{no single solution}'}`,
});
