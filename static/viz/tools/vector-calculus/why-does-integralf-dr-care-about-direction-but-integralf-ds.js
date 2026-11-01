import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FIELDS, work, arcIntegral, reversed, bump } from './_vector-calculus-math.js';
import { WINDOW, drawPath, pathArrow, fieldArrows } from './_vector-calculus-view.js';

const state = { dir: 'forward', field: 'wind' };
const CHOICES = ['wind', 'swirl', 'source'];
const forward = bump([-3.5, -2], [3.5, 2], 2);
const f = (x, y) => 1.5 + Math.sin(x) * 0.5 + y / 6;
const path = (s) => (s.dir === 'forward' ? forward : reversed(forward));

const tool = createTool({
  state,
  label: 'A path through a force field with arrowheads showing which way it is walked. Reversing it flips the sign of the work but leaves the curtain area unchanged.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const F = FIELDS[state.field];
    const p = path(state);
    plot.axes({ grid: false });
    fieldArrows(ctx, plot, (x, y) => [F.P(x, y), F.Q(x, y)], c, { step: 1, color: c.grid, soft: 3 });
    drawPath(ctx, plot, p, { color: c.a, width: 5 });
    for (const t of [0.25, 0.5, 0.75]) pathArrow(ctx, plot, p, t, { color: c.ink, width: 4 });
    plot.point(...p.r(0), { fill: c.c, r: 8 });
    plot.text('start', p.r(0)[0], p.r(0)[1] - 0.6, { size: 11 });
  },
  controls: [
    { title: 'Walk it which way?' },
    { key: 'dir', label: 'Direction', options: [['forward', 'Left to right'], ['back', 'Right to left']] },
    { key: 'field', label: 'Force field', options: CHOICES.map((k) => [k, FIELDS[k].name]) },
    { readout: [
      ['Work ∫ F · dr', (s) => fixed(work(FIELDS[s.field], path(s)), 3)],
      ['Curtain ∫ f ds', (s) => fixed(arcIntegral(f, path(s)), 3)],
    ] },
  ],
  tex: (s) => `\\int_{-C}\\mathbf{F}\\cdot d\\mathbf{r} = -\\int_C \\mathbf{F}\\cdot d\\mathbf{r},\\qquad \\int_{-C} f\\,ds = \\int_C f\\,ds`,
});
