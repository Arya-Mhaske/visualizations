import { createTool } from '../../lib/tool.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { plane, vec } from './_la-view.js';

// One equation a x + b y = r in two unknowns. The null vector n = (−b, a) has A n = 0.
const state = { a: 1, b: 2, r: 4, s: 1.5, show: true };
const norm2 = (s) => s.a * s.a + s.b * s.b;
const xp = (s) => [(s.r * s.a) / norm2(s), (s.r * s.b) / norm2(s)];
const nul = (s) => [-s.b, s.a];
const sol = (s) => [xp(s)[0] + s.s * nul(s)[0], xp(s)[1] + s.s * nul(s)[1]];

createTool({
  state,
  label: 'The line of all solutions to one equation in two unknowns, drawn together with the nullspace, the line through the origin parallel to it. One particular solution is marked. Sliding along the solution line by a multiple of the null vector gives another solution every time.',
  setup: (stage, c) => plane(stage, c, 6),
  draw(ctx, stage, c, plot) {
    const p = xp(state);
    const n = nul(state);
    plot.axes();
    const far = 20;
    plot.segment(p[0] - far * n[0], p[1] - far * n[1], p[0] + far * n[0], p[1] + far * n[1], { color: c.a, width: 4 });
    if (state.show) plot.segment(-far * n[0], -far * n[1], far * n[0], far * n[1], { color: c.b, width: 3, dash: [7, 5] });
    vec(ctx, plot, c, [0, 0], p, { color: c.ink, width: 4, text: 'x_p' });
    vec(ctx, plot, c, p, sol(state), { color: c.c, width: 5, text: 's·n', dx: 8, dy: 12 });
    dot(ctx, ...plot.toPx(...sol(state)), 8, c.fillY, c.ink);
    plot.text('solutions of Ax = b', -5.8, 5.4, { size: 11, color: c.a, align: 'left', patch: false });
    if (state.show) plot.text('nullspace: Ax = 0', -5.8, 4.6, { size: 11, color: c.b, align: 'left', patch: false });
  },
  controls: [
    { title: 'Slide along the null vector' },
    { key: 's', label: 'Multiple s of the null vector', min: -3, max: 3, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'show', label: 'Show the nullspace line', toggle: true },
    { key: 'a', label: 'Equation: x coefficient', min: 1, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'b', label: 'Equation: y coefficient', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'r', label: 'Right side b', min: -6, max: 6, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Particular x_p', (s) => `(${fixed(xp(s)[0], 3)}, ${fixed(xp(s)[1], 3)})`],
      ['x_p + s·n', (s) => `(${fixed(sol(s)[0], 3)}, ${fixed(sol(s)[1], 3)})`],
      ['A(x_p + s·n)', (s) => ({ text: fixed(s.a * sol(s)[0] + s.b * sol(s)[1], 3), good: true })],
    ] },
  ],
  tex: (s) => `${s.a}x${s.b < 0 ? '-' : '+'}${Math.abs(s.b)}y=${s.r}:\\quad \\mathbf x=\\mathbf x_p+s\\,\\mathbf n,\\ \\ \\mathbf n=(${-s.b},\\,${s.a})`,
});
