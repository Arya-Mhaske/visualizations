import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FIELDS, vec2, work, segment, bump, arcPath, dot, norm } from './_vector-calculus-math.js';
import { WINDOW, arrowAt, drawPath } from './_vector-calculus-view.js';

const state = { field: 'wind', path: 'line', u: 0.5 };
const A = [-3.5, -2.5];
const B = [3.5, 2.5];
const PATHS = {
  line: { name: 'Straight', make: () => segment(A, B) },
  bent: { name: 'Bent', make: () => bump(A, B, 2.5) },
  arc: { name: 'Arc over the top', make: () => arcPath([0, 0], 3.8, Math.PI, 0) },
};
const CHOICES = ['wind', 'swirl', 'source', 'shear'];
const path = (s) => PATHS[s.path].make();

const tool = createTool({
  state,
  label: 'A path through a force field. At points along the path the force is split into a part along the path (coral) and a part across it (grey). Only the coral part adds to the work.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const F = FIELDS[state.field];
    const p = path(state);
    plot.axes({ grid: false });
    drawPath(ctx, plot, p, { color: c.ink, width: 2 });
    drawPath(ctx, plot, p, { b: state.u, color: c.c, width: 6 });
    const marks = 14;
    for (let i = 0; i <= marks; i++) {
      const t = (i / marks) * state.u;
      const [x, y] = p.r(t);
      const d = p.d(t);
      const T = [d[0] / norm(d), d[1] / norm(d)];
      const f = vec2(F, x, y);
      const along = dot(f, T);
      arrowAt(ctx, plot, x, y, f[0] - along * T[0], f[1] - along * T[1], { k: 22, cap: 40, color: c.grid, width: 2, head: 6 });
      arrowAt(ctx, plot, x, y, along * T[0], along * T[1], { k: 22, cap: 40, color: c.a, width: 3, head: 7 });
    }
    plot.point(...p.r(state.u), { fill: c.a, r: 7 });
  },
  controls: [
    { title: 'Push a block along the path' },
    { key: 'field', label: 'Force field', options: CHOICES.map((k) => [k, FIELDS[k].name]) },
    { key: 'path', label: 'Path', options: Object.entries(PATHS).map(([k, v]) => [k, v.name]) },
    { key: 'u', label: 'How far along', min: 0, max: 1, step: 0.02, format: (v) => `${Math.round(v * 100)}%` },
    { readout: [
      ['Work so far', (s) => fixed(work(FIELDS[s.field], path(s), s.u), 3)],
      ['Work on whole path', (s) => fixed(work(FIELDS[s.field], path(s)), 3)],
    ] },
  ],
  tex: (s) => `W = \\int_C \\mathbf{F}\\cdot d\\mathbf{r} = ${fixed(work(FIELDS[s.field], path(s), s.u), 3)}`,
});
