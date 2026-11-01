import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FIELDS, rectCirculation, simpson } from './_vector-calculus-math.js';
import { WINDOW, arrowAt } from './_vector-calculus-view.js';

const F = FIELDS.quad;      // F = (−y², x): curl = 1 + 2y
const X0 = -4;
const Y0 = -4;
const SIDE = 8;
const state = { n: 3, show: 'loops' };
const tiles = (n) => {
  const out = [];
  const h = SIDE / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out.push([X0 + i * h, Y0 + j * h, X0 + (i + 1) * h, Y0 + (j + 1) * h]);
  return out;
};
const sumOfTiles = (n) => tiles(n).reduce((s, t) => s + rectCirculation(F, ...t), 0);
const rim = () => rectCirculation(F, X0, Y0, X0 + SIDE, Y0 + SIDE);
const interior = () => simpson((y) => simpson(() => 1 + 2 * y, X0, X0 + SIDE, 2), Y0, Y0 + SIDE, 200);

const tool = createTool({
  state,
  label: 'A square region cut into small square tiles. Each tile has a counter-clockwise loop. Where two tiles meet, their arrows point opposite ways and cancel, leaving only the outer edge.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ grid: false });
    const h = SIDE / state.n;
    const inset = h * 0.1;
    const edge = (x1, y1, x2, y2, isRim, color, width) => {
      const [dx, dy] = [x2 - x1, y2 - y1];
      const len = Math.hypot(dx, dy);
      arrowAt(ctx, plot, x1, y1, dx, dy, { k: 1e9, cap: Math.abs(plot.toPx(len, 0)[0] - plot.toPx(0, 0)[0]) * 0.92, color, width, head: 9 });
    };
    for (const [a, b, c2, d] of tiles(state.n)) {
      const [x0, y0, x1, y1] = [a + inset, b + inset, c2 - inset, d - inset];
      const onRim = [Math.abs(a - X0) < 1e-9, Math.abs(c2 - (X0 + SIDE)) < 1e-9, Math.abs(b - Y0) < 1e-9, Math.abs(d - (Y0 + SIDE)) < 1e-9];
      const sides = [[x0, y0, x1, y0, onRim[2]], [x1, y0, x1, y1, onRim[1]], [x1, y1, x0, y1, onRim[3]], [x0, y1, x0, y0, onRim[0]]];
      for (const [px, py, qx, qy, isRim] of sides) {
        if (state.show === 'rim' && !isRim) continue;
        const colour = isRim ? c.c : (state.show === 'cancel' ? c.grid : c.a);
        edge(px, py, qx, qy, isRim, colour, isRim ? 4 : 2);
      }
    }
  },
  controls: [
    { title: 'Cut into tiles' },
    { key: 'n', label: 'Tiles per side', min: 1, max: 6, step: 1 },
    { key: 'show', label: 'Show', options: [['loops', 'Every tile loop'], ['cancel', 'Cancelling edges in grey'], ['rim', 'Only the outer rim']] },
    { readout: [
      ['Number of tiles', (s) => String(s.n * s.n)],
      ['Sum of tile circulations', (s) => fixed(sumOfTiles(s.n), 3)],
      ['Circulation round the rim', () => fixed(rim(), 3)],
      ['∬ (Q_x − P_y) dA', () => fixed(interior(), 3)],
    ] },
  ],
  tex: () => '\\sum_{\\text{tiles}}\\oint \\mathbf{F}\\cdot d\\mathbf{r} = \\oint_{\\text{rim}} \\mathbf{F}\\cdot d\\mathbf{r} = \\iint_R \\left(\\dfrac{\\partial Q}{\\partial x} - \\dfrac{\\partial P}{\\partial y}\\right) dA',
});
