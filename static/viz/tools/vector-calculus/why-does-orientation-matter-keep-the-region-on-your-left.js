import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FIELDS, work, ellipsePath, reversed, norm } from './_vector-calculus-math.js';
import { WINDOW, drawPath, arrowAt, pathArrow } from './_vector-calculus-view.js';

const F = FIELDS.quad;   // curl = 1 + 2y
const state = { dir: 'ccw', a: 3, b: 2, cy: 1, u: 0.25 };
const loop = (s) => (s.dir === 'ccw' ? ellipsePath([0, s.cy], s.a, s.b) : reversed(ellipsePath([0, s.cy], s.a, s.b)));
const area = (s) => Math.PI * s.a * s.b;
const interior = (s) => area(s) * (1 + 2 * s.cy);

const tool = createTool({
  state,
  label: 'An oval region with its boundary walked in one direction. A short arrow from the walker points to the walker\'s left. Counter-clockwise, that arrow points into the region.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const p = loop(state);
    plot.axes({ grid: false });
    drawPath(ctx, plot, ellipsePath([0, state.cy], state.a, state.b), { color: c.grid, width: 1 });
    drawPath(ctx, plot, p, { color: c.ink, width: 3 });
    for (const t of [0.125, 0.375, 0.625, 0.875]) pathArrow(ctx, plot, p, t, { color: c.ink, width: 3 });
    drawPath(ctx, plot, p, { b: state.u, color: state.dir === 'ccw' ? c.c : c.a, width: 7 });
    const [x, y] = p.r(state.u);
    const d = p.d(state.u);
    const left = [-d[1] / norm(d), d[0] / norm(d)];
    arrowAt(ctx, plot, x, y, left[0], left[1], { k: 1e9, cap: 34, color: c.b, width: 3, head: 9 });
    plot.point(x, y, { fill: c.ink, r: 6 });
    plot.text('left', x + left[0] * 1.1, y + left[1] * 1.1, { size: 11, color: c.b });
  },
  controls: [
    { title: 'Walk the boundary' },
    { key: 'dir', label: 'Direction', options: [['ccw', 'Counter-clockwise'], ['cw', 'Clockwise']] },
    { key: 'u', label: 'Walker position', min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'a', label: 'Half-width a', min: 1, max: 4, step: 0.5 },
    { key: 'b', label: 'Half-height b', min: 1, max: 3, step: 0.5 },
    { key: 'cy', label: 'Centre height', min: -1, max: 1, step: 0.5 },
    { readout: [
      ['∮ F · dr', (s) => fixed(work(F, loop(s), 1, 720), 3)],
      ['∬ (Q_x − P_y) dA', (s) => fixed(interior(s), 3)],
      ['Region on your…', (s) => (s.dir === 'ccw' ? 'left' : 'right')],
    ] },
  ],
  tex: (s) => (s.dir === 'ccw' ? '\\oint_{\\partial R}\\mathbf{F}\\cdot d\\mathbf{r} = +\\iint_R (Q_x - P_y)\\,dA' : '\\oint_{-\\partial R}\\mathbf{F}\\cdot d\\mathbf{r} = -\\iint_R (Q_x - P_y)\\,dA'),
});
