import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly, dot } from '../../lib/draw.js';
import { SURF, drawLevel, levelList, grad } from './_mv.js';

// Water runs in the direction of steepest descent, −∇f, so its path crosses every contour at a right angle.
const TERRAIN = {
  two: { name: 'Two hills', f: SURF.two.f },
  bowl: { name: 'Valley', f: (x, y) => (x * x + 0.5 * y * y) / 3 },
  saddle: { name: 'Pass', f: SURF.saddle.f },
  waves: { name: 'Ridges', f: SURF.waves.f },
};
const state = { terrain: 'two', x: 0.4, y: 1.4, many: false };
const R = 3;

export function runPath(f, x0, y0, step = 0.04, maxSteps = 500) {
  const pts = [[x0, y0]];
  let [x, y] = [x0, y0];
  for (let i = 0; i < maxSteps; i++) {
    const g = grad(f, x, y);
    const len = Math.hypot(...g);
    if (len < 0.02) break;
    x -= (g[0] / len) * step;
    y -= (g[1] / len) * step;
    if (Math.abs(x) > R || Math.abs(y) > R) break;
    pts.push([x, y]);
  }
  return pts;
}

createTool({
  state,
  label: 'A contour map of a terrain with a ball dropped at a chosen spot. The path it follows is always straight downhill, crossing contour lines at right angles, until it reaches a low point or leaves the map.',
  setup: (stage, c) => createPlot(stage, { x: [-3.4, 3.4], y: [-3.4, 3.4], c }),
  draw(ctx, stage, c, plot) {
    const { f } = TERRAIN[state.terrain];
    plot.axes();
    levelList(f, R, 12).forEach((l) => drawLevel(ctx, plot, f, l, R, { color: c.grid, width: 1.5 }));
    const starts = state.many ? [...Array(10).keys()].map((k) => [2.6 * Math.cos((2 * Math.PI * k) / 10), 2.6 * Math.sin((2 * Math.PI * k) / 10)]) : [[state.x, state.y]];
    starts.forEach(([sx, sy], i) => {
      const pts = runPath(f, sx, sy);
      poly(ctx, pts.map(([x, y]) => plot.toPx(x, y)), { stroke: i % 2 ? c.b : c.a, width: 3, closed: false });
      dot(ctx, ...plot.toPx(sx, sy), 6, c.fillA, c.ink, 2);
      dot(ctx, ...plot.toPx(...pts[pts.length - 1]), 5, c.fillC, c.ink, 2);
    });
  },
  controls: [
    { title: 'Drop a ball' },
    { key: 'terrain', label: 'Terrain', options: Object.entries(TERRAIN).map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'Start x', min: -3, max: 3, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'y', label: 'Start y', min: -3, max: 3, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'many', label: 'Drop ten balls in a ring', toggle: true },
    { readout: [
      ['Path length (steps)', () => String(runPath(TERRAIN[state.terrain].f, state.x, state.y).length)],
      ['Starts at height', () => TERRAIN[state.terrain].f(state.x, state.y).toFixed(2)],
      ['Ends at height', () => { const p = runPath(TERRAIN[state.terrain].f, state.x, state.y); return TERRAIN[state.terrain].f(...p[p.length - 1]).toFixed(2); }],
    ] },
  ],
  tex: () => '\\frac{d\\mathbf r}{dt}=-\\nabla f',
});
