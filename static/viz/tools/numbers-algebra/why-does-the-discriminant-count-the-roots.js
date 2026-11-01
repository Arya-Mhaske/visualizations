import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { countRoots, disc, realRoots, vertexHeight } from './_quadratic-equations-math.js';

const state = { a: 1, b: 2, c: -3 };
const f = (s = state) => (x) => s.a * x * x + s.b * x + s.c;

createTool({
  state,
  label: 'A parabola you can slide up and down by changing c. The vertex is marked with a vertical segment to the x-axis, whose length is minus the discriminant over 4a. While the vertex is below the axis the curve crosses twice, when it touches the curve crosses once, and when it floats above the curve never crosses.',
  setup: (stage, c) => createPlot(stage, { x: [-7, 7], y: [-12, 12], c }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn(f(), { color: c.a, width: 4 });
    const vx = -state.b / (2 * state.a);
    const vy = vertexHeight(state.a, state.b, state.c);
    plot.segment(vx, vy, vx, 0, { color: c.d, width: 4 });
    plot.point(vx, vy, { fill: c.fillY, r: 8 });
    realRoots(state.a, state.b, state.c).forEach((r) => plot.point(r, 0, { fill: c.c, r: 7 }));
  },
  controls: [
    { title: 'Slide the parabola' },
    { key: 'c', label: 'c (slides it up and down)', min: -10, max: 10, step: 0.5 },
    { key: 'b', label: 'b', min: -6, max: 6, step: 1 },
    { key: 'a', label: 'a', min: 1, max: 3, step: 1 },
    { readout: [
      ['b² − 4ac', (s) => fixed(disc(s.a, s.b, s.c), 2)],
      ['Vertex height', (s) => fixed(vertexHeight(s.a, s.b, s.c), 2)],
      ['Crossings', (s) => ({ text: `${countRoots(s.a, s.b, s.c)}`, good: countRoots(s.a, s.b, s.c) > 0 })],
    ] },
  ],
  tex: (s) => `\\text{vertex height}=-\\dfrac{b^2-4ac}{4a}=-\\dfrac{${fixed(disc(s.a, s.b, s.c), 2)}}{${4 * s.a}}=${fixed(vertexHeight(s.a, s.b, s.c), 2)}`,
});
