import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';
import { line } from '../../lib/draw.js';

// F(x, y(x)) = 0. The chain-rule tree gives F_x · 1 + F_y · dy/dx = 0, so dy/dx = −F_x / F_y.
export const CURVES = {
  circle: { name: 'x² + y² = 25', F: (x, y) => x * x + y * y - 25, Fx: (x) => 2 * x, Fy: (x, y) => 2 * y, xr: [-4.9, 4.9] },
  ellipse: { name: 'x²/16 + y²/4 = 1', F: (x, y) => x * x / 16 + y * y / 4 - 1, Fx: (x) => x / 8, Fy: (x, y) => y / 2, xr: [-3.9, 3.9] },
  hyper: { name: 'y² − x² = 1', F: (x, y) => y * y - x * x - 1, Fx: (x) => -2 * x, Fy: (x, y) => 2 * y, xr: [-4, 4] },
  cubic: { name: 'y³ + y = x', F: (x, y) => y ** 3 + y - x, Fx: () => -1, Fy: (x, y) => 3 * y * y + 1, xr: [-5, 5] },
};
const state = { curve: 'circle', x: 3 };
// The upper (largest y) branch above x.
export function solveY(C, x) {
  let prev = C.F(x, 8);
  for (let y = 8; y > -8; y -= 0.01) {
    const cur = C.F(x, y - 0.01);
    if (Math.sign(cur) !== Math.sign(prev)) {
      let [lo, hi] = [y - 0.01, y];
      for (let k = 0; k < 50; k++) { const mid = (lo + hi) / 2; if (Math.sign(C.F(x, mid)) === Math.sign(C.F(x, lo))) lo = mid; else hi = mid; }
      return (lo + hi) / 2;
    }
    prev = cur;
  }
  return null;
}
const point = () => { const C = CURVES[state.curve]; const x = Math.max(C.xr[0], Math.min(C.xr[1], state.x)); return [x, solveY(C, x)]; };
const slope = () => { const C = CURVES[state.curve]; const [x, y] = point(); return -C.Fx(x, y) / C.Fy(x, y); };

createTool({
  state,
  label: 'A curve defined by an equation in x and y with a tangent line at a chosen point. The slope of the tangent is minus F sub x over F sub y at that point, and the readouts show both partial derivatives.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-6, 6], c }),
  draw(ctx, stage, c, plot) {
    const C = CURVES[state.curve];
    plot.axes();
    for (const [p, q] of contour(C.F, -6, 6, 80)) line(ctx, ...plot.toPx(...p), ...plot.toPx(...q), { color: c.ink, width: 3 });
    const [x, y] = point();
    const m = slope();
    plot.segment(x - 2, y - 2 * m, x + 2, y + 2 * m, { color: c.a, width: 3 });
    plot.point(x, y);
  },
  controls: [
    { title: 'Pick a curve and a point' },
    { key: 'curve', label: 'Curve F(x, y) = 0', options: Object.entries(CURVES).map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'x', min: -5, max: 5, step: 0.1, format: (v) => Math.max(CURVES[state.curve].xr[0], Math.min(CURVES[state.curve].xr[1], v)).toFixed(1) },
    { readout: [
      ['Point on the curve', () => point().map((v) => v.toFixed(2)).join(', ')],
      ['F_x', () => { const [x, y] = point(); return CURVES[state.curve].Fx(x, y).toFixed(3); }],
      ['F_y', () => { const [x, y] = point(); return CURVES[state.curve].Fy(x, y).toFixed(3); }],
      ['dy/dx = −F_x / F_y', () => slope().toFixed(3)],
    ] },
  ],
  tex: () => '\\frac{dy}{dx}=-\\frac{F_x}{F_y}',
});
