import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { annuityFV, rupee } from './_exp-log-math.js';

const state = { D: 5000, r: 8, y: 20 };
const months = (s) => s.y * 12;
const at = (s, m) => annuityFV(s.D, s.r / 100, m);

createTool({
  state,
  label: 'A savings plan with a fixed deposit at the end of every month. The straight line is the total you put in. The coral curve is the balance, because each deposit also grows. The shaded gap between them is the interest, and it is small at first and large near the end.',
  setup: (stage, c) => createPlot(stage, { x: [0, 240], y: [0, 3000000], c, pad: 34 }),
  draw(ctx, stage, c, plot) {
    const m = months(state);
    plot.setRange([0, m], [0, at(state, m) * 1.08]);
    plot.axes({ xLabel: 'months', yLabel: '₹' });
    plot.shade((x) => at(state, x), (x) => state.D * x, 0, m, c.fillY);
    plot.fn((x) => state.D * x, { color: c.b, width: 4 });
    plot.fn((x) => at(state, x), { color: c.a, width: 4 });
    plot.point(m, at(state, m), { fill: c.a, r: 8 });
    plot.point(m, state.D * m, { fill: c.b, r: 8 });
  },
  controls: [
    { title: 'Save every month' },
    { key: 'D', label: 'Monthly deposit', min: 500, max: 50000, step: 500, format: rupee },
    { key: 'r', label: 'Yearly rate', min: 0, max: 15, step: 1, format: (v) => `${v}%` },
    { key: 'y', label: 'Years', min: 1, max: 40, step: 1 },
    { readout: [
      ['You put in', (s) => rupee(s.D * months(s))],
      ['Balance at the end', (s) => ({ text: rupee(at(s, months(s))), good: true })],
      ['Interest earned', (s) => rupee(at(s, months(s)) - s.D * months(s))],
      ['First deposit grows to', (s) => rupee(s.D * (1 + s.r / 1200) ** (months(s) - 1))],
    ] },
  ],
  tex: (s) => `FV=D\\,\\dfrac{(1+i)^{m}-1}{i}=${s.D}\\cdot\\dfrac{(1+${(s.r / 1200).toFixed(5)})^{${months(s)}}-1}{${(s.r / 1200).toFixed(5)}}`,
});
