import { fixed } from '../../lib/format.js';
import { area2, triangleTool } from './_triangle-view.js';

const points = [[-3, -2], [0, 0.5], [3, 4]];
const flat = () => Math.abs(area2(points)) < 1e-9;

triangleTool({
  points,
  label: 'Three points A, B and C that you can drag, with the line through A and B. If C lies on that line the three points are collinear, the triangle has no area, and the determinant with a column of ones is zero. Move C off the line and the area becomes positive.',
  fill: (P, c) => (Math.abs(area2(P)) < 1e-9 ? c.grid : c.fillB),
  extraDraw: (ctx, plot, c, P) => {
    const [a, b] = P;
    const d = [b[0] - a[0], b[1] - a[1]];
    if (Math.hypot(...d) > 1e-9) plot.segment(a[0] - 20 * d[0], a[1] - 20 * d[1], a[0] + 20 * d[0], a[1] + 20 * d[1], { color: flat() ? c.c : c.grid, width: flat() ? 5 : 2, dash: flat() ? [] : [6, 5] });
  },
  readout: [
    ['A, B, C', () => points.map((p) => `(${fixed(p[0], 1)}, ${fixed(p[1], 1)})`).join(' ')],
    ['The determinant', () => ({ text: fixed(area2(points), 2), good: flat() })],
    ['Area of the triangle', () => fixed(Math.abs(area2(points)) / 2, 3)],
    ['The points are', () => ({ text: flat() ? 'collinear' : 'not collinear', good: flat() })],
  ],
  tex: () => `\\begin{vmatrix}${points.map((p) => `${fixed(p[0], 1)}&${fixed(p[1], 1)}&1`).join('\\\\')}\\end{vmatrix}=${fixed(area2(points), 2)}${flat() ? '=0\\ \\Rightarrow\\ \\text{collinear}' : '\\ne0'}`,
});
