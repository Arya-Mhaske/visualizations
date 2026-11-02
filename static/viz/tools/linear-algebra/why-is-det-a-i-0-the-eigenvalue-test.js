import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { stackBoxes } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';
import { det2, eig2 } from './_la-math.js';
import { IDENTITY, circlePts, curve, vec } from './_la-view.js';

const state = { a: 2, b: 1, c: 1, d: 2, lam: 0.5 };
const shifted = (s) => [[s.a - s.lam, s.b], [s.c, s.d - s.lam]];
const poly = (s, lam) => (s.a - lam) * (s.d - lam) - s.b * s.c;

const tool = createTool({
  state,
  label: 'Two graphs. The top one shows the unit circle and its image under the matrix A minus lambda times the identity. The bottom one plots the determinant of that matrix against lambda. When lambda is an eigenvalue the determinant is zero, and the image of the circle squashes flat onto a line, because some non-zero vector is sent to zero.',
  setup: (stage, c) => {
    const [top, bottom] = stackBoxes(2);
    return [
      createPlot(stage, { x: [-5, 5], y: [-5, 5], c, pad: 10, box: (st) => { const b = top(st); const size = Math.min(b.w, b.h); return { x: b.x + (b.w - size) / 2, y: b.y + (b.h - size) / 2, w: size, h: size }; } }),
      createPlot(stage, { x: [-2, 5], y: [-6, 12], c, pad: 22, box: bottom }),
    ];
  },
  draw(ctx, stage, c, [up, low]) {
    const S = shifted(state);
    up.axes({ grid: false, xLabel: '', yLabel: '' });
    curve(ctx, up, circlePts(), IDENTITY, { color: c.grid, width: 2, closed: true });
    curve(ctx, up, circlePts(), S, { color: c.b, width: 4, closed: true });
    const e = eig2([[state.a, state.b], [state.c, state.d]]);
    if (e.real && Math.abs(det2(S)) < 1e-9) {
      const v = e.v[Math.abs(state.lam - e.l[0]) < 1e-6 ? 0 : 1];
      if (v) vec(ctx, up, c, [0, 0], v.map((t) => t * 1.0), { color: c.c, width: 5, text: 'x', dx: 10, dy: 10 });
    }
    low.axes({ xLabel: 'λ', yLabel: 'det(A−λI)' });
    low.fn((l) => poly(state, l), { color: c.a, width: 4, domain: [-2, 5] });
    if (e.real) e.l.forEach((l) => low.point(l, 0, { fill: c.fillC, r: 6 }));
    low.point(state.lam, poly(state, state.lam), { fill: c.fillY, r: 8 });
  },
  controls: (t) => [
    { title: 'Shift the matrix by λ' },
    { key: 'lam', label: 'λ', min: -2, max: 5, step: 0.1, format: (n) => fixed(n, 1) },
    { row: [{ button: 'Jump to an eigenvalue', onClick() { const e = eig2([[state.a, state.b], [state.c, state.d]]); if (e.real) { const next = e.l.map((v) => Math.round(v * 10) / 10).find((v) => Math.abs(v - state.lam) > 0.05) ?? e.l[0]; state.lam = next; t.update(); } } }] },
    { key: 'a', label: 'Row 1, col 1', min: -2, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'Row 1, col 2', min: -2, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'c', label: 'Row 2, col 1', min: -2, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'd', label: 'Row 2, col 2', min: -2, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['det(A − λI)', (s) => ({ text: fixed(poly(s, s.lam), 3), good: Math.abs(poly(s, s.lam)) < 0.05 })],
      ['Eigenvalues of A', (s) => { const e = eig2([[s.a, s.b], [s.c, s.d]]); return e.real ? e.l.map((v) => fixed(v, 3)).join(', ') : `complex: ${fixed(e.re, 2)} ± ${fixed(e.im, 2)}i`; }],
    ] },
  ],
  tex: (s) => `\\det(A-\\lambda I)=\\lambda^2-${fixed(s.a + s.d, 1)}\\lambda+${fixed(s.a * s.d - s.b * s.c, 2)}=${fixed(poly(s, s.lam), 3)}`,
});
void tool;
