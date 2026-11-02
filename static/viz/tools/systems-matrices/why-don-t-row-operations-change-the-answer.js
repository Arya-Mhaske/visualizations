import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { plane } from '../linear-algebra/_la-view.js';

// Rows [a, b, c] mean a x + b y = c. The solution of both is (2, 3).
const ROWS = [[1, 2, 8], [3, -1, 3]];
const state = { op: 'add', k: 1 };
const OPS = { swap: 'Swap the rows', scale: 'Multiply row 1 by k', add: 'Add k × row 1 to row 2' };
const after = (s) => {
  const [r1, r2] = ROWS;
  if (s.op === 'swap') return [r2, r1];
  if (s.op === 'scale') return [r1.map((v) => v * s.k), r2];
  return [r1, r2.map((v, i) => v + s.k * r1[i])];
};
const legal = (s) => !(s.op === 'scale' && Math.abs(s.k) < 1e-9);
const check = (row) => row[0] * 2 + row[1] * 3 - row[2];

function drawLine(plot, [a, b, c], color, width, dash = []) {
  if (Math.abs(a) < 1e-9 && Math.abs(b) < 1e-9) return;
  const d = [-b, a];
  const o = [(a * c) / (a * a + b * b), (b * c) / (a * a + b * b)];
  plot.segment(o[0] - 30 * d[0], o[1] - 30 * d[1], o[0] + 30 * d[0], o[1] + 30 * d[1], { color, width, dash });
}

createTool({
  state,
  label: 'Two lines meeting at the point (2, 3). A row operation replaces the pair of equations by a new pair, drawn as coloured lines over the original grey ones. Swapping rows gives the same two lines. Multiplying a row by a non-zero number gives the same line. Adding a multiple of one row to the other gives a new line, but it still passes through the point (2, 3), so the solution does not move. Multiplying by zero would destroy the equation, which is why it is not allowed.',
  setup: (stage, c) => plane(stage, c, 6),
  draw(ctx, stage, c, plot) {
    plot.axes();
    ROWS.forEach((r) => drawLine(plot, r, c.grid, 9));
    if (legal(state)) after(state).forEach((r, i) => drawLine(plot, r, i ? c.b : c.a, 3, i ? [] : []));
    plot.point(2, 3, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Do a row operation' },
    { key: 'op', label: 'Operation', options: Object.entries(OPS) },
    { key: 'k', label: 'The number k', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['New row 1', (s) => after(s)[0].map((v) => fixed(v, 2)).join('  ')],
      ['New row 2', (s) => after(s)[1].map((v) => fixed(v, 2)).join('  ')],
      ['(2, 3) fits row 1?', (s) => ({ text: Math.abs(check(after(s)[0])) < 1e-9 ? 'yes' : 'no', good: Math.abs(check(after(s)[0])) < 1e-9 })],
      ['(2, 3) fits row 2?', (s) => ({ text: Math.abs(check(after(s)[1])) < 1e-9 ? 'yes' : 'no', good: Math.abs(check(after(s)[1])) < 1e-9 })],
      ['Legal move?', (s) => ({ text: legal(s) ? 'yes' : 'no: 0 × an equation loses it', good: legal(s) })],
    ] },
  ],
  tex: () => '\\begin{cases}x+2y=8\\\\3x-y=3\\end{cases}\\ \\text{has the solution}\\ (2,\\ 3)\\ \\text{before and after a legal row operation}',
});
