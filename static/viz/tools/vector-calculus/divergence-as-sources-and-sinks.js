import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { FIELDS, vec2, div2, boxOutflow } from './_vector-calculus-math.js';
import { WINDOW, fieldArrows, arrowAt } from './_vector-calculus-view.js';

const state = { field: 'source', px: 1, py: 1, size: 2 };
const CHOICES = ['source', 'stretch', 'swirl', 'saddle', 'wind'];

const tool = createTool({
  state,
  label: 'A small box placed in a flow. On each side the flow through the box is drawn: out of the box in green, into the box in blue. More out than in means a source.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const F = FIELDS[state.field];
    plot.axes({ grid: false });
    fieldArrows(ctx, plot, (x, y) => vec2(F, x, y), c, { step: 1, color: c.grid, soft: 2 });
    const { px, py, size } = state;
    const h = size / 2;
    const corners = [[px - h, py - h], [px + h, py - h], [px + h, py + h], [px - h, py + h]];
    poly(ctx, corners.map(([x, y]) => plot.toPx(x, y)), { fill: c.fillY, stroke: c.ink, width: 3 });
    const sides = [[px + h, py, 1, 0], [px - h, py, -1, 0], [px, py + h, 0, 1], [px, py - h, 0, -1]];
    for (const [x, y, nx, ny] of sides) {
      const f = vec2(F, x, y);
      const out = f[0] * nx + f[1] * ny;
      arrowAt(ctx, plot, x, y, nx * out, ny * out, { k: 30, cap: 70, color: out >= 0 ? c.c : c.b, width: 4, head: 10 });
    }
    plot.point(px, py, { fill: c.ink, r: 4 });
  },
  controls: [
    { title: 'Place a box' },
    { key: 'field', label: 'Flow', options: CHOICES.map((k) => [k, FIELDS[k].name]) },
    { key: 'px', label: 'Box x', min: -3, max: 3, step: 1 },
    { key: 'py', label: 'Box y', min: -3, max: 3, step: 1 },
    { key: 'size', label: 'Box side', min: 0.5, max: 3, step: 0.5 },
    { readout: [
      ['Net flow out', (s) => fixed(boxOutflow(FIELDS[s.field], s.px, s.py, s.size), 3)],
      ['Per unit area', (s) => fixed(boxOutflow(FIELDS[s.field], s.px, s.py, s.size) / s.size ** 2, 3)],
      ['div F = P_x + Q_y', (s) => fixed(div2(FIELDS[s.field], s.px, s.py), 3)],
      ['It is a…', (s) => { const d = div2(FIELDS[s.field], s.px, s.py); return Math.abs(d) < 1e-9 ? 'neither' : d > 0 ? 'source' : 'sink'; }],
    ] },
  ],
  tex: (s) => `\\operatorname{div}\\mathbf{F} = \\lim_{\\text{box}\\to 0}\\dfrac{\\text{flow out}}{\\text{area}} = \\dfrac{\\partial P}{\\partial x} + \\dfrac{\\partial Q}{\\partial y} = ${fixed(div2(FIELDS[s.field], s.px, s.py), 3)}`,
});
