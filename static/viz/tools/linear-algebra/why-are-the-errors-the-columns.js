import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { dot, project } from './_la-math.js';

// Four measurements at t = 0, 1, 2, 3. The error vector e = b − (C + D t) is a list of four numbers. The best line is the one
// where e is perpendicular to both columns of A: to the all-ones column (e sums to 0) and to the t column (e·t = 0).
const T = [0, 1, 2, 3];
const Y = [1, 3, 2, 5];
const A = T.map((t) => [1, t]);
const best = project(A, Y).x;
const state = { C: 0, D: 1 };
const err = (s) => Y.map((y, i) => y - (s.C + s.D * T[i]));

const tool = createTool({
  state,
  label: 'Four measurements and a line that you can adjust with two sliders. Vertical bars show the errors. Two readouts show the errors added up and the errors weighted by t. Both are zero only for the best-fit line, where the error vector is perpendicular to the column of ones and the column of t values.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 3.5], y: [-1, 7], c, pad: 24 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't', yLabel: 'y' });
    plot.fn((t) => state.C + state.D * t, { color: c.a, width: 4, domain: [-0.5, 3.5] });
    plot.fn((t) => best[0] + best[1] * t, { color: c.grid, width: 3, dash: [6, 5], domain: [-0.5, 3.5] });
    T.forEach((t, i) => {
      plot.segment(t, Y[i], t, state.C + state.D * t, { color: c.d, width: 5 });
      plot.point(t, Y[i], { fill: c.fillY, r: 7 });
    });
  },
  controls: (t) => [
    { title: 'Set your own line' },
    { key: 'C', label: 'Height at t = 0, C', min: -2, max: 4, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'D', label: 'Slope, D', min: -1, max: 3, step: 0.1, format: (n) => fixed(n, 1) },
    { row: [{ button: 'Jump to the best fit', onClick() { state.C = Math.round(best[0] * 10) / 10; state.D = Math.round(best[1] * 10) / 10; t.update(); } }] },
    { readout: [
      ['Errors e', (s) => err(s).map((v) => fixed(v, 1)).join(', ')],
      ['e · (1, 1, 1, 1)', (s) => ({ text: fixed(dot(err(s), [1, 1, 1, 1]), 2), good: Math.abs(dot(err(s), [1, 1, 1, 1])) < 0.05 })],
      ['e · (0, 1, 2, 3)', (s) => ({ text: fixed(dot(err(s), T), 2), good: Math.abs(dot(err(s), T)) < 0.05 })],
      ['Total squared error', (s) => fixed(dot(err(s), err(s)), 3)],
    ] },
  ],
  tex: (s) => `\\mathbf e\\cdot\\mathbf 1=${fixed(dot(err(s), [1, 1, 1, 1]), 2)},\\quad \\mathbf e\\cdot\\mathbf t=${fixed(dot(err(s), T), 2)}\\ \\ (\\text{best fit: } C=${fixed(best[0], 2)},\\ D=${fixed(best[1], 2)})`,
});
void tool;
