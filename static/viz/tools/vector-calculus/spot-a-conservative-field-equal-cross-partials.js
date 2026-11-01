import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FIELDS, curl2, circleCirculation, TAU } from './_vector-calculus-math.js';
import { WINDOW, RANGE, fieldArrows, drawPath } from './_vector-calculus-view.js';
import { arcPath } from './_vector-calculus-math.js';

const state = { field: 'cross', px: 1, py: 1, ring: 2 };
const CHOICES = ['cross', 'quad', 'swirl', 'shear', 'hole'];
const VERDICT = {
  cross: 'equal everywhere: conservative',
  quad: 'unequal: not conservative',
  swirl: 'unequal: not conservative',
  shear: 'unequal: not conservative',
  hole: 'equal everywhere, yet NOT conservative: the origin is a hole',
};

const tool = createTool({
  state,
  label: 'A map shaded by Q_x minus P_y: coral where positive, blue where negative, blank where it is zero. A loop round the origin shows the one field that is blank but still not conservative.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const F = FIELDS[state.field];
    plot.axes({ grid: false });
    const cell = 0.5;
    ctx.save();
    for (let x = -RANGE; x < RANGE; x += cell) {
      for (let y = -RANGE; y < RANGE; y += cell) {
        const [mx, my] = [x + cell / 2, y + cell / 2];
        if (Math.hypot(mx, my) < 0.3 && state.field === 'hole') continue;
        const k = curl2(F, mx, my);
        if (Math.abs(k) < 1e-9) continue;
        ctx.globalAlpha = Math.min(0.55, 0.12 + Math.abs(k) * 0.08);
        ctx.fillStyle = k > 0 ? c.a : c.b;
        const [x0, y0] = plot.toPx(x, y + cell);
        const [x1, y1] = plot.toPx(x + cell, y);
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      }
    }
    ctx.restore();
    fieldArrows(ctx, plot, (x, y) => [F.P(x, y), F.Q(x, y)], c, { step: 1, color: c.ink, width: 1.5, soft: 2 });
    if (state.field === 'hole') {
      drawPath(ctx, plot, arcPath([0, 0], state.ring, 0, TAU), { color: c.c, width: 4 });
      plot.point(0, 0, { fill: c.ink, r: 5 });
    }
    plot.point(state.px, state.py, { fill: c.c, r: 7 });
  },
  controls: [
    { title: 'Test the cross-partials' },
    { key: 'field', label: 'Field F = (P, Q)', options: CHOICES.map((k) => [k, FIELDS[k].name]) },
    { key: 'px', label: 'Probe x', min: -4, max: 4, step: 1 },
    { key: 'py', label: 'Probe y', min: -4, max: 4, step: 1 },
    { key: 'ring', label: 'Loop round the origin (hole field)', min: 1, max: 4, step: 1 },
    { readout: [
      ['∂P/∂y at probe', (s) => fixed(FIELDS[s.field].Py(s.px, s.py), 3)],
      ['∂Q/∂x at probe', (s) => fixed(FIELDS[s.field].Qx(s.px, s.py), 3)],
      ['Verdict', (s) => VERDICT[s.field]],
      ['Loop round the origin', (s) => (s.field === 'hole' ? fixed(circleCirculation(FIELDS.hole, [0, 0], s.ring), 3) : '–')],
    ] },
  ],
  tex: (s) => {
    const F = FIELDS[s.field];
    return `\\dfrac{\\partial P}{\\partial y} = ${fixed(F.Py(s.px, s.py), 3)},\\quad \\dfrac{\\partial Q}{\\partial x} = ${fixed(F.Qx(s.px, s.py), 3)}`;
  },
});
