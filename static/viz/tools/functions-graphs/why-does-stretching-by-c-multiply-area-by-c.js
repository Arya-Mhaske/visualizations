import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const circle = Array.from({ length: 96 }, (_, i) => [1.5 * Math.cos((2 * Math.PI * i) / 96) + 1.5, 1.5 * Math.sin((2 * Math.PI * i) / 96) + 1.5]);
const SHAPES = [
  { name: 'L shape', pts: [[0, 0], [3, 0], [3, 1], [1, 1], [1, 3], [0, 3]] },
  { name: 'Triangle', pts: [[0, 0], [3, 0], [0, 3]] },
  { name: 'Circle', pts: circle },
];
const state = { shape: 0, sx: 2, sy: 1 };
const shoelace = (pts) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const stretched = (s = state) => SHAPES[s.shape].pts.map(([x, y]) => [x * s.sx, y * s.sy]);

createTool({
  state,
  label: 'A shape on a grid of unit squares, in grey, and the same shape stretched horizontally by sx and vertically by sy, in coral. Every unit square of the grid becomes a rectangle sx wide and sy tall, with area sx times sy. So the area of the whole shape, which is made of those squares, is multiplied by sx times sy. The readout compares the two areas.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 11], y: [-1, 11], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-1, 11], [-1, 11]);
    plot.axes({ xLabel: '', yLabel: '' });
    const px = (p) => plot.toPx(...p);
    poly(ctx, stretched().map(px), { fill: c.fillA, stroke: c.ink, width: 3 });
    for (let i = 0; i <= 10; i++) {
      line(ctx, ...plot.toPx(i * state.sx, 0), ...plot.toPx(i * state.sx, 10), { color: c.grid, width: 1 });
      line(ctx, ...plot.toPx(0, i * state.sy), ...plot.toPx(10, i * state.sy), { color: c.grid, width: 1 });
    }
    poly(ctx, SHAPES[state.shape].pts.map(px), { fill: c.fillB, stroke: c.ink, width: 3 });
  },
  controls: [
    { title: 'Stretch the shape' },
    { key: 'shape', label: 'Shape', min: 0, max: SHAPES.length - 1, step: 1, format: (v) => SHAPES[v].name },
    { key: 'sx', label: 'Horizontal stretch, sx', min: 0.5, max: 3, step: 0.5 },
    { key: 'sy', label: 'Vertical stretch, sy', min: 0.5, max: 3, step: 0.5 },
    { readout: [
      ['Area before', (s) => fixed(shoelace(SHAPES[s.shape].pts), 3)],
      ['Area after', (s) => fixed(shoelace(stretched(s)), 3)],
      ['Ratio', (s) => ({ text: fixed(shoelace(stretched(s)) / shoelace(SHAPES[s.shape].pts), 3), good: true })],
      ['sx × sy', (s) => fixed(s.sx * s.sy, 3)],
    ] },
  ],
  tex: (s) => `\\text{area}\\times(${s.sx}\\cdot${s.sy})=${fixed(shoelace(SHAPES[s.shape].pts), 2)}\\times${fixed(s.sx * s.sy, 2)}=${fixed(shoelace(stretched(s)), 2)}`,
});
