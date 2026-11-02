import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { classify2 } from './_sm-math.js';
import { vec } from '../linear-algebra/_la-view.js';
import { poly } from '../../lib/draw.js';

// a x + b y = e (row 1), c x + d y = f (row 2). Left: the two lines. Right: the columns and their parallelogram.
const state = { a: 2, b: 1, c: 1, d: 2, e: 4, f: 5 };
const result = (s) => classify2(s.a, s.b, s.e, s.c, s.d, s.f);

createTool({
  state,
  label: 'Left: the two lines of a system of two equations. Right: the two columns of its coefficients and the parallelogram they span. When the determinant is zero the parallelogram has no area, the columns lie on one line, the two lines on the left are parallel or identical, and there is no single solution.',
  setup: (stage, c) => [
    createPlot(stage, { x: [-6, 6], y: [-6, 6], c, pad: 10, box: (st) => ({ x: 0, y: 0, w: st.w / 2, h: st.h }) }),
    createPlot(stage, { x: [-6, 6], y: [-6, 6], c, pad: 10, box: (st) => ({ x: st.w / 2, y: 0, w: st.w / 2, h: st.h }) }),
  ],
  draw(ctx, stage, c, [left, right]) {
    const r = result(state);
    left.axes({ grid: false, xLabel: '', yLabel: '' });
    right.axes({ grid: false, xLabel: '', yLabel: '' });
    const line = (a, b, e, color) => {
      if (Math.abs(b) > 1e-9) left.segment(-9, (e + 9 * a) / b, 9, (e - 9 * a) / b, { color, width: 4 });
      else if (Math.abs(a) > 1e-9) left.segment(e / a, -9, e / a, 9, { color, width: 4 });
    };
    line(state.a, state.b, state.e, c.a);
    line(state.c, state.d, state.f, c.b);
    if (r.kind === 'one') left.point(r.x, r.y, { fill: c.fillY, r: 7 });
    const u = [state.a, state.c];
    const v = [state.b, state.d];
    poly(ctx, [[0, 0], u, [u[0] + v[0], u[1] + v[1]], v].map((p) => right.toPx(...p)), { fill: r.det >= 0 ? c.fillC : c.fillA, stroke: c.ink, width: 3 });
    vec(ctx, right, c, [0, 0], u, { color: c.a, width: 4 });
    vec(ctx, right, c, [0, 0], v, { color: c.b, width: 4 });
    vec(ctx, right, c, [0, 0], [state.e, state.f], { color: c.d, width: 3, text: 'b', dx: 8, dy: 8 });
  },
  controls: [
    { title: 'Change the system' },
    { key: 'a', label: 'Row 1, x', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'b', label: 'Row 1, y', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'c', label: 'Row 2, x', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'd', label: 'Row 2, y', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'e', label: 'Right side, row 1', min: -6, max: 6, step: 1, format: (n) => `${n}` },
    { key: 'f', label: 'Right side, row 2', min: -6, max: 6, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Determinant', (s) => ({ text: fixed(result(s).det, 2), good: Math.abs(result(s).det) > 1e-9 })],
      ['Area of the parallelogram', (s) => fixed(Math.abs(result(s).det), 2)],
      ['The system has', (s) => { const r = result(s); return r.kind === 'one' ? `one solution (${fixed(r.x, 2)}, ${fixed(r.y, 2)})` : r.kind === 'none' ? 'no solution' : 'infinitely many solutions'; }],
    ] },
  ],
  tex: (s) => `\\det=ad-bc=${fixed(result(s).det, 2)}`,
});
