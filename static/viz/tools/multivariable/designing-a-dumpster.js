import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line } from '../../lib/draw.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';

// An open-topped box of fixed volume V with length x, width y and height z = V/(xy). Cost = bottom + sides (per m²).
// C(x, y) = cb·xy + cs·2(x + y)·V/(xy). Contours of C show where it is cheapest.
const state = { V: 12, cb: 20, cs: 10, x: 4, y: 4 };
const cost = (s, x, y) => s.cb * x * y + s.cs * 2 * (x + y) * (s.V / (x * y));
export function best(s) {
  let top = { c: Infinity };
  for (let i = 0; i <= 200; i++) for (let j = 0; j <= 200; j++) {
    const x = 0.5 + (5 * i) / 200;
    const y = 0.5 + (5 * j) / 200;
    const c = cost(s, x, y);
    if (c < top.c) top = { c, x, y };
  }
  return top;
}

createTool({
  state,
  label: 'A map of the cost of a dumpster of fixed volume against its length and width. Contours join designs with equal cost. Your design is a coral dot and the cheapest design is a green dot at the bottom of the valley.',
  setup: (stage, c) => createPlot(stage, { x: [0.5, 5.5], y: [0.5, 5.5], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'length x (m)', yLabel: 'width y (m)' });
    const b = best(state);
    [1.05, 1.2, 1.5, 2, 3].forEach((k) => {
      for (const [p, q] of contour((x, y) => cost(state, 0.5 + (x + 0) * 0, y) * 0 + cost(state, Math.max(x, 0.5), Math.max(y, 0.5)) - b.c * k, 0.5, 5.5, 70)) line(ctx, ...plot.toPx(...p), ...plot.toPx(...q), { color: c.grid, width: 1.5 });
    });
    plot.point(state.x, state.y);
    plot.point(b.x, b.y, { fill: c.fillC });
  },
  controls: [
    { title: 'Design the box' },
    { key: 'V', label: 'Volume (m³)', min: 6, max: 30, step: 1 },
    { key: 'cb', label: 'Bottom cost per m²', min: 5, max: 40, step: 1 },
    { key: 'cs', label: 'Side cost per m²', min: 5, max: 40, step: 1 },
    { key: 'x', label: 'Length x', min: 0.6, max: 5.4, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'y', label: 'Width y', min: 0.6, max: 5.4, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['Height z = V/(xy)', (s) => (s.V / (s.x * s.y)).toFixed(2)],
      ['Your cost', (s) => cost(s, s.x, s.y).toFixed(1)],
      ['Cheapest (x, y)', () => { const b = best(state); return `${b.x.toFixed(2)}, ${b.y.toFixed(2)}`; }],
      ['Cheapest cost', () => best(state).c.toFixed(1)],
    ] },
  ],
  tex: (s) => `C=${s.cb}xy+${s.cs}\\cdot 2(x+y)\\dfrac{${s.V}}{xy}`,
});
