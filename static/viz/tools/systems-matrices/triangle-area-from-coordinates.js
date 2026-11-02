import { fixed } from '../../lib/format.js';
import { area2, triangleTool } from './_triangle-view.js';

const points = [[-3, -2], [3, -1], [0, 4]];
const det3 = (P) => area2(P);

triangleTool({
  points,
  label: 'A triangle with three corners A, B and C that you can drag. The area of the triangle is half the absolute value of a three by three determinant built from the coordinates of the corners, with a column of ones. The determinant is positive when the corners go anticlockwise and negative when they go clockwise.',
  fill: (P, c) => (det3(P) >= 0 ? c.fillC : c.fillA),
  readout: [
    ['A, B, C', () => points.map((p) => `(${fixed(p[0], 1)}, ${fixed(p[1], 1)})`).join(' ')],
    ['The determinant', () => fixed(det3(points), 2)],
    ['Area = ½ |determinant|', () => ({ text: fixed(Math.abs(det3(points)) / 2, 3), good: true })],
    ['Corners go', () => (det3(points) > 0 ? 'anticlockwise' : det3(points) < 0 ? 'clockwise' : 'in a straight line')],
  ],
  tex: () => `\\text{Area}=\\dfrac12\\left|\\begin{vmatrix}${points.map((p) => `${fixed(p[0], 1)}&${fixed(p[1], 1)}&1`).join('\\\\')}\\end{vmatrix}\\right|=${fixed(Math.abs(det3(points)) / 2, 3)}`,
});
