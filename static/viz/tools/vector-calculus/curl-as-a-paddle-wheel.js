import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { FIELDS, vec2, curl2 } from './_vector-calculus-math.js';
import { WINDOW, fieldArrows, arrowAt } from './_vector-calculus-view.js';

const state = { field: 'swirl', px: 1, py: 1, t: 1 };
const CHOICES = ['swirl', 'shear', 'source', 'saddle', 'wind'];
const omega = (s) => curl2(FIELDS[s.field], s.px, s.py) / 2;
const R = 0.9;

const tool = createTool({
  state,
  label: 'A small paddle wheel placed in a flow. The flow pushes the blades round on one side more than the other. The wheel turns at half the curl.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const F = FIELDS[state.field];
    plot.axes({ grid: false });
    fieldArrows(ctx, plot, (x, y) => vec2(F, x, y), c, { step: 1, color: c.grid, soft: 2 });
    const angle = omega(state) * state.t;
    const [cx, cy] = plot.toPx(state.px, state.py);
    const scale = Math.abs(plot.toPx(R, 0)[0] - plot.toPx(0, 0)[0]);
    for (let k = 0; k < 4; k++) {
      const a = angle + (k * Math.PI) / 2;
      const [ex, ey] = [state.px + R * Math.cos(a), state.py + R * Math.sin(a)];
      line(ctx, cx, cy, ...plot.toPx(ex, ey), { color: c.ink, width: 4 });
      // A blade across the spoke's end, and the push that the flow gives it along the turn.
      const [bx, by] = [-Math.sin(a), Math.cos(a)];
      const half = 0.25;
      poly(ctx, [[ex - bx * half, ey - by * half], [ex + bx * half, ey + by * half]].map(([x, y]) => plot.toPx(x, y)), { stroke: c.a, width: 6, closed: false });
      const f = vec2(F, ex, ey);
      const along = f[0] * bx + f[1] * by;
      arrowAt(ctx, plot, ex, ey, bx * along, by * along, { k: 36, cap: 60, color: along >= 0 ? c.c : c.b, width: 3, head: 8 });
    }
    plot.point(state.px, state.py, { fill: c.ink, r: 6 });
  },
  controls: [
    { title: 'Drop in the wheel' },
    { key: 'field', label: 'Flow', options: CHOICES.map((k) => [k, FIELDS[k].name]) },
    { key: 'px', label: 'Wheel x', min: -4, max: 4, step: 1 },
    { key: 'py', label: 'Wheel y', min: -4, max: 4, step: 1 },
    { key: 't', label: 'Time passed', min: 0, max: 6, step: 0.25 },
    { readout: [
      ['curl F = Q_x − P_y', (s) => fixed(curl2(FIELDS[s.field], s.px, s.py), 3)],
      ['Spin rate (curl / 2)', (s) => fixed(omega(s), 3)],
      ['Turned', (s) => `${fixed((omega(s) * s.t * 180) / Math.PI, 0)}°`],
      ['Spinning', (s) => { const w = omega(s); return Math.abs(w) < 1e-9 ? 'not at all' : w > 0 ? 'counter-clockwise' : 'clockwise'; }],
    ] },
  ],
  tex: (s) => `\\operatorname{curl}\\mathbf{F} = \\dfrac{\\partial Q}{\\partial x} - \\dfrac{\\partial P}{\\partial y} = ${fixed(curl2(FIELDS[s.field], s.px, s.py), 3)}`,
});
