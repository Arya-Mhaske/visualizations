import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FIELDS, work, segment, bump } from './_vector-calculus-math.js';
import { WINDOW, drawPath, drawContours, fieldArrows } from './_vector-calculus-view.js';

const state = { field: 'cross', bend: 2 };
const A = [-3, -1];
const B = [3, 2];
const CHOICES = ['cross', 'source', 'saddle', 'swirl'];
const paths = (s) => [segment(A, B), bump(A, B, s.bend), bump(A, B, -s.bend * 1.4)];
const height = (F, p) => (F.f ? F.f(...p) : null);

const tool = createTool({
  state,
  label: 'Contours of a potential, which is the height, with three different paths from A to B. In a conservative field the work on each equals the rise in height.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const F = FIELDS[state.field];
    plot.axes({ grid: false });
    if (F.f) drawContours(ctx, plot, F.f, [-20, -15, -10, -6, -3, -1, 1, 3, 6, 10, 15, 20].map((v) => v / 2), { color: c.grid, width: 1.5 });
    else fieldArrows(ctx, plot, (x, y) => [F.P(x, y), F.Q(x, y)], c, { step: 1, color: c.grid, soft: 3 });
    const colours = [c.a, c.b, c.c];
    paths(state).forEach((p, i) => drawPath(ctx, plot, p, { color: colours[i], width: 4 }));
    plot.point(...A, { fill: c.ink, r: 7 });
    plot.point(...B, { fill: c.ink, r: 7 });
    plot.text('A', A[0] - 0.4, A[1] - 0.5, { size: 12 });
    plot.text('B', B[0] + 0.4, B[1] + 0.5, { size: 12 });
  },
  controls: [
    { title: 'Three roads from A to B' },
    { key: 'field', label: 'Force field', options: CHOICES.map((k) => [k, FIELDS[k].name + (FIELDS[k].f ? '' : '  (no potential)')]) },
    { key: 'bend', label: 'How far the roads bend', min: 0, max: 3, step: 0.5 },
    { readout: [
      ['Work, coral', (s) => fixed(work(FIELDS[s.field], paths(s)[0]), 3)],
      ['Work, blue', (s) => fixed(work(FIELDS[s.field], paths(s)[1]), 3)],
      ['Work, green', (s) => fixed(work(FIELDS[s.field], paths(s)[2]), 3)],
      ['Rise in height f(B) − f(A)', (s) => { const F = FIELDS[s.field]; return F.f ? fixed(F.f(...B) - F.f(...A), 3) : 'no height exists'; }],
    ] },
  ],
  tex: (s) => (FIELDS[s.field].f
    ? `\\int_C \\nabla f\\cdot d\\mathbf{r} = f(B) - f(A) = ${fixed(FIELDS[s.field].f(...B) - FIELDS[s.field].f(...A), 3)}`
    : '\\text{No } f \\text{ with } \\nabla f = \\mathbf{F}:\\ \\text{the three works differ}'),
});
