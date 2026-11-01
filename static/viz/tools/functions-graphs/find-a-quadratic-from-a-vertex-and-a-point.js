import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';
import { grab } from './_fx.js';

const state = { h: 1, k: -2, x: 4, y: 7 };
const R = 8;
const a = (s = state) => (s.x === s.h ? NaN : (s.y - s.k) / (s.x - s.h) ** 2);

const tool = createTool({
  state,
  label: 'A vertex fixed by two sliders and a point you can drag anywhere else on the grid. The parabola with that vertex that passes through the point has its steepness a found from the point: a equals the height of the point above the vertex divided by the square of its horizontal distance from the vertex. Move the point and a changes, with the parabola following.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    if (Number.isFinite(a())) plot.fn((x) => a() * (x - state.h) ** 2 + state.k, { color: c.a, width: 4 });
    else plot.segment(state.h, -R, state.h, R, { color: c.a, width: 3, dash: [5, 4] });
    plot.point(state.h, state.k, { fill: c.fillY, r: 9 });
    plot.point(state.x, state.y, { fill: c.b, r: 9 });
    plot.text('vertex', state.h + 0.4, state.k - 0.7, { size: 11, align: 'left', patch: false });
    plot.text('P', state.x + 0.5, state.y + 0.6, { size: 12, patch: false });
  },
  controls: [
    { title: 'Fix the vertex, drag the point' },
    { key: 'h', label: 'Vertex x, h', min: -5, max: 5, step: 1 },
    { key: 'k', label: 'Vertex y, k', min: -5, max: 5, step: 1 },
    { text: 'Drag P, or use the arrow keys.' },
    { readout: [
      ['Horizontal distance', (s) => `${s.x - s.h}`],
      ['Vertical distance', (s) => `${s.y - s.k}`],
      ['a', (s) => (Number.isFinite(a(s)) ? { text: fixed(a(s), 3), good: true } : 'P is on the axis: no a works')],
    ] },
  ],
  tex: (s) => (Number.isFinite(a(s)) ? `a=\\dfrac{y-k}{(x-h)^2}=\\dfrac{${s.y - s.k}}{(${s.x - s.h})^2}=${fixed(a(s), 3)}` : 'x=h:\\ \\text{no a}'),
});

handles(tool.stage, [grab(tool, state, 'x', 'y', { lo: -7, hi: 7 })], { onChange: () => tool.update(), radius: 28 });
tool.update();
