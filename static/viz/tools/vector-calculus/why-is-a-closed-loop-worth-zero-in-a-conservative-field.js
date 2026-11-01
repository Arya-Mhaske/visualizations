import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FIELDS, work, ellipsePath } from './_vector-calculus-math.js';
import { WINDOW, drawPath, drawContours, fieldArrows } from './_vector-calculus-view.js';

const state = { field: 'cross', cx: 0, cy: 1, size: 2.5, u: 0.5 };
const CHOICES = ['cross', 'saddle', 'swirl', 'quad'];
const loop = (s) => ellipsePath([s.cx, s.cy], s.size, s.size * 0.7);
const so = (s) => work(FIELDS[s.field], loop(s), s.u, 720);
const height = (s) => { const F = FIELDS[s.field]; return F.f ? F.f(...loop(s).r(s.u)) - F.f(...loop(s).r(0)) : null; };

const tool = createTool({
  state,
  label: 'A loop walked round in a force field, with contours of the potential behind it. In a conservative field the height gained so far matches the work so far, and you finish at the height you started.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const F = FIELDS[state.field];
    const p = loop(state);
    plot.axes({ grid: false });
    if (F.f) drawContours(ctx, plot, F.f, [-20, -15, -10, -6, -3, -1, 1, 3, 6, 10, 15, 20].map((v) => v / 2), { color: c.grid, width: 1.5 });
    else fieldArrows(ctx, plot, (x, y) => [F.P(x, y), F.Q(x, y)], c, { step: 1, color: c.grid, soft: 3 });
    drawPath(ctx, plot, p, { color: c.ink, width: 2 });
    drawPath(ctx, plot, p, { b: state.u, color: c.a, width: 6 });
    plot.point(...p.r(0), { fill: c.ink, r: 6 });
    plot.point(...p.r(state.u), { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Walk once round' },
    { key: 'field', label: 'Force field', options: CHOICES.map((k) => [k, FIELDS[k].name + (FIELDS[k].f ? '' : '  (no potential)')]) },
    { key: 'u', label: 'How far round', min: 0, max: 1, step: 0.02, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'cx', label: 'Loop centre x', min: -2, max: 2, step: 1 },
    { key: 'cy', label: 'Loop centre y', min: -2, max: 2, step: 1 },
    { key: 'size', label: 'Loop size', min: 1, max: 3, step: 0.5 },
    { readout: [
      ['Work so far', (s) => fixed(so(s), 3)],
      ['Height gained so far', (s) => { const h = height(s); return h === null ? 'no height exists' : fixed(h, 3); }],
      ['Work, full loop', (s) => fixed(work(FIELDS[s.field], loop(s), 1, 720), 3)],
    ] },
  ],
  tex: (s) => (FIELDS[s.field].f ? '\\oint_C \\nabla f\\cdot d\\mathbf{r} = f(\\text{end}) - f(\\text{start}) = 0' : '\\oint_C \\mathbf{F}\\cdot d\\mathbf{r} \\ne 0'),
});
