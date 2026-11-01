import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arc, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { hyperbolaC } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

const state = { a: 3, b: 2, step: 3 };
const R = 8;
const LINES = ['The vertices are at (±a, 0), and the box reaches up to ±b', 'The box corners are at (±a, ±b)', 'The asymptote is the diagonal of the box, of length √(a² + b²)', 'Swing the diagonal down to the axis: it lands on the foci', 'Now the hyperbola hugs the diagonals, and c² = a² + b²'];

createTool({
  state,
  label: 'Building a hyperbola from its box. First the vertices on the x-axis, then a rectangle reaching a to each side and b up and down. The diagonals of the rectangle are the asymptotes. Swing a diagonal down to the x-axis with a compass and it lands exactly on the foci, so the distance from the centre to a focus is the diagonal, c, and c squared is a squared plus b squared.',
  setup: (stage, col) => createPlot(stage, { x: [-R, R], y: [-R, R], c: col, pad: 14 }),
  draw(ctx, stage, col, plot) {
    plot.axes({ xLabel: '', yLabel: '' });
    const { a, b } = state;
    const cc = hyperbolaC(a, b);
    if (state.step >= 1) poly(ctx, [plot.toPx(-a, -b), plot.toPx(a, -b), plot.toPx(a, b), plot.toPx(-a, b)], { fill: col.fillB, stroke: col.ink, width: 3 });
    plot.point(a, 0, { fill: col.fillY, r: 7 });
    plot.point(-a, 0, { fill: col.fillY, r: 7 });
    if (state.step >= 2) {
      plot.segment(-cc * a / cc * 2.2, -b * 2.2, a * 2.2, b * 2.2, { color: col.b, width: 3, dash: [6, 5] });
      plot.segment(-a * 2.2, b * 2.2, a * 2.2, -b * 2.2, { color: col.b, width: 3, dash: [6, 5] });
      plot.segment(0, 0, a, b, { color: col.a, width: 5 });
      plot.text('c = √(a² + b²)', a / 2 - 1.6, b / 2 + 0.8, { size: 11, color: col.a, patch: false });
    }
    if (state.step >= 3) {
      const O = plot.toPx(0, 0);
      const k = plot.toPx(cc, 0)[0] - O[0];
      arc(ctx, ...O, k, -Math.atan2(b, a), 0, { color: col.a, width: 3, dash: [5, 4] });
      plot.point(cc, 0, { fill: col.c, r: 8 });
      plot.point(-cc, 0, { fill: col.c, r: 8 });
      plot.text('F', cc + 0.5, -0.7, { size: 12, patch: false });
    }
    if (state.step >= 4) [-1, 1].forEach((side) => curve(plot, trace((t) => [side * a * Math.cosh(t), b * Math.sinh(t)], -3, 3, 200), { color: col.ink, width: 4 }));
  },
  controls: [
    { title: 'Build the box' },
    { key: 'step', label: 'Construction step', min: 0, max: 4, step: 1, format: (n) => `${n + 1} of 5` },
    { key: 'a', label: 'a', min: 1, max: 5, step: 0.5 },
    { key: 'b', label: 'b', min: 1, max: 5, step: 0.5 },
    { readout: [
      ['This step', (s) => LINES[s.step]],
      ['Diagonal, c', (s) => fixed(hyperbolaC(s.a, s.b), 3)],
      ['a² + b²', (s) => fixed(s.a * s.a + s.b * s.b, 2)],
    ] },
  ],
  tex: (s) => `c^2=a^2+b^2=${s.a}^2+${s.b}^2=${fixed(s.a * s.a + s.b * s.b, 2)}\\Rightarrow c=${fixed(hyperbolaC(s.a, s.b), 3)}`,
});
