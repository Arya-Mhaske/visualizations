import { createTool } from '../../lib/tool.js';
import { label, poly } from '../../lib/draw.js';
import { squareAreas, trianglesAt } from './_right-triangle-math.js';

const state = { a: 3, b: 4, t: 0 };
let tool;

tool = createTool({
  state,
  label: 'A big square with four copies of one right triangle inside it. At the start the triangles leave one tilted square in the middle, with area c squared. Slide to the end and the same triangles leave two squares, with areas a squared and b squared. The square and the triangles did not change, so the empty areas are equal.',
  draw(ctx, stage, c) {
    const s = state.a + state.b;
    const k = (Math.min(stage.w, stage.h) * 0.84) / s;
    const [left, bottom] = [(stage.w - s * k) / 2, (stage.h + s * k) / 2];
    const px = ([x, y]) => [left + x * k, bottom - y * k];
    poly(ctx, [[0, 0], [s, 0], [s, s], [0, s]].map(px), { fill: c.fillY, stroke: c.ink, width: 3 });
    trianglesAt(state.a, state.b, state.t).forEach((tri, i) => {
      poly(ctx, [tri.R, tri.P1, tri.P2].map(px), { fill: [c.fillA, c.fillB, c.fillC, c.fillA][i], stroke: c.ink, width: 3 });
    });
    const at = (x, y, text) => label(ctx, text, ...px([x, y]), c, { size: 14, bounds: stage, patch: false });
    if (state.t <= 0.001) at(s / 2, s / 2, 'c²');
    else if (state.t >= 0.999) {
      at(state.b / 2, state.b / 2, 'b²');
      at(state.b + state.a / 2, state.b + state.a / 2, 'a²');
    }
    label(ctx, state.t <= 0.001 ? 'Empty: one square, c²' : state.t >= 0.999 ? 'Empty: two squares, a² and b²' : 'Same triangles, sliding', 8, 12, c, { size: 11, align: 'left', bounds: stage, patch: false });
  },
  controls: [
    { title: 'Slide the four triangles' },
    { key: 't', label: 'Slide', min: 0, max: 1, step: 0.01, format: (n) => (n <= 0 ? 'start' : n >= 1 ? 'end' : `${Math.round(n * 100)}%`) },
    { row: [
      { button: 'Start', ghost: true, onClick() { state.t = 0; tool.update(); } },
      { button: 'End', ghost: true, onClick() { state.t = 1; tool.update(); } },
    ] },
    { key: 'a', label: 'Short leg, a', min: 1, max: 6, step: 1 },
    { key: 'b', label: 'Long leg, b', min: 1, max: 6, step: 1 },
    { readout: [
      ['a²', (s) => squareAreas(s.a, s.b).a2],
      ['b²', (s) => squareAreas(s.a, s.b).b2],
      ['a² + b²', (s) => squareAreas(s.a, s.b).a2 + squareAreas(s.a, s.b).b2],
      ['c² (the tilted square)', (s) => squareAreas(s.a, s.b).c2],
    ] },
  ],
  tex: (s) => `a^2+b^2=${s.a}^2+${s.b}^2=${squareAreas(s.a, s.b).c2}=c^2`,
});
