import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// xy = A and 2x + 2y = P. Then x + y = P/2 and x, y are the roots of t² − (P/2) t + A = 0.
const state = { area: 12, perim: 16 };
const half = (s) => s.perim / 2;
const disc = (s) => half(s) ** 2 - 4 * s.area;
const dims = (s) => (disc(s) < -1e-9 ? [] : [(half(s) + Math.sqrt(Math.max(disc(s), 0))) / 2, (half(s) - Math.sqrt(Math.max(disc(s), 0))) / 2]);

createTool({
  state,
  label: 'The hyperbola x times y equals the area, and the straight line x plus y equals half the perimeter, on one graph. Where they cross are the possible sides of the rectangle. The line may cut the curve twice, just touch it once, which is a square, or miss it completely, meaning no rectangle has that area and perimeter. A scale drawing of the rectangle is shown in the corner.',
  setup: (stage, c) => createPlot(stage, { x: [0, 20], y: [0, 20], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => state.area / x, { color: c.a, width: 4, domain: [0.2, 20] });
    plot.segment(0, half(state), half(state), 0, { color: c.b, width: 4 });
    const [p, q] = dims(state);
    if (p !== undefined) {
      plot.point(p, q, { fill: c.fillY, r: 8 });
      plot.point(q, p, { fill: c.fillY, r: 8 });
      const [x0, y0] = plot.toPx(12, 19);
      const k = plot.toPx(1, 0)[0] - plot.toPx(0, 0)[0];
      poly(ctx, [[x0, y0], [x0 + p * k * 0.35, y0], [x0 + p * k * 0.35, y0 + q * k * 0.35], [x0, y0 + q * k * 0.35]], { fill: c.fillC, stroke: c.ink, width: 3 });
    }
  },
  controls: [
    { title: 'Area and perimeter' },
    { key: 'area', label: 'Area', min: 1, max: 100, step: 1, format: (n) => `${n}` },
    { key: 'perim', label: 'Perimeter', min: 4, max: 40, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Length and width', (s) => (dims(s).length ? `${fixed(dims(s)[0], 3)} and ${fixed(dims(s)[1], 3)}` : 'no such rectangle')],
      ['Discriminant (P/2)² − 4A', (s) => ({ text: fixed(disc(s), 2), good: disc(s) >= 0 })],
      ['Verdict', (s) => (disc(s) < -1e-9 ? 'line misses the curve' : Math.abs(disc(s)) < 1e-9 ? 'a square (they touch)' : 'two crossings, one rectangle')],
    ] },
  ],
  tex: (s) => `t^2-${fixed(half(s), 1)}\\,t+${s.area}=0,\\quad \\Delta=${fixed(disc(s), 2)}`,
});
