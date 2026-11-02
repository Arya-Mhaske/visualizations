import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { rad } from '../linear-algebra/_la-math.js';
import { plane } from '../linear-algebra/_la-view.js';

// Two lines meet at P. Line i has normal n_i = (cos θ_i, sin θ_i) and reads n_i · (x, y) = n_i · P.
// Adding t times line 2 to line 1 gives (n1 + t n2) · (x, y) = (n1 + t n2) · P, which still passes through P.
const state = { px: 2, py: 1, t1: 30, t2: 120, t: 1 };
const normal = (deg) => [Math.cos(rad(deg)), Math.sin(rad(deg))];
const eq = (s, n) => ({ a: n[0], b: n[1], c: n[0] * s.px + n[1] * s.py });
const sum = (s) => { const [n1, n2] = [normal(s.t1), normal(s.t2)]; return eq(s, [n1[0] + s.t * n2[0], n1[1] + s.t * n2[1]]); };

function drawLine(plot, e, color, width, dash = []) {
  if (Math.hypot(e.a, e.b) < 1e-9) return;
  const d = [-e.b, e.a];
  const o = [(e.a * e.c) / (e.a ** 2 + e.b ** 2), (e.b * e.c) / (e.a ** 2 + e.b ** 2)];
  plot.segment(o[0] - 20 * d[0], o[1] - 20 * d[1], o[0] + 20 * d[0], o[1] + 20 * d[1], { color, width, dash });
}

createTool({
  state,
  label: 'Two lines that cross at a point P. A third line is made by adding a multiple t of line 2 to line 1. However t is chosen, the new line still passes through P, so the solution of the original pair is also a solution of the new equation. Elimination chooses t so the new line is horizontal or vertical.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    const e = sum(state);
    plot.axes();
    drawLine(plot, eq(state, normal(state.t1)), c.a, 4);
    drawLine(plot, eq(state, normal(state.t2)), c.b, 4);
    drawLine(plot, e, c.d, 4, [8, 5]);
    plot.point(state.px, state.py, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Add the equations' },
    { key: 't', label: 'Add t × (line 2) to line 1', min: -3, max: 3, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 't1', label: 'Direction of line 1', min: 10, max: 170, step: 10, format: (n) => `${n}°` },
    { key: 't2', label: 'Direction of line 2', min: 10, max: 170, step: 10, format: (n) => `${n}°` },
    { key: 'px', label: 'Crossing point x', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'py', label: 'Crossing point y', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['New equation at the crossing point', (s) => { const e = sum(s); return { text: `${fixed(e.a * s.px + e.b * s.py, 3)} = ${fixed(e.c, 3)}`, good: true }; }],
      ['Is the crossing point on the new line?', () => ({ text: 'yes, for every t', good: true })],
    ] },
  ],
  tex: (s) => `\\text{if } L_1(P)=0\\text{ and } L_2(P)=0\\text{, then } (L_1+${fixed(s.t, 2)}L_2)(P)=0`,
});
