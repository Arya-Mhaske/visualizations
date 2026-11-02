import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from './_ig.js';

// x² + bx + c = (x + b/2)² + d², with d² = c − b²/4. When d² > 0: ∫ dx/(x²+bx+c) = (1/d) arctan((x + b/2)/d).
const state = { b: 4, c: 13 };
const d2 = (s) => s.c - (s.b * s.b) / 4;
const f = (s) => (x) => 1 / (x * x + s.b * x + s.c);

const tool = createTool({
  state,
  label: 'A bell-shaped graph of one over x squared plus b x plus c. A dashed vertical line marks the centre at x equals minus b over 2. The area under the curve to the right of the centre is shaded, and its value comes from an arctangent.',
  setup: (stage, c) => createPlot(stage, { x: [-10, 6], y: [0, 0.5], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const g = f(state);
    const m = -state.b / 2;
    const dd = Math.sqrt(Math.max(d2(state), 0.01));
    plot.setRange([m - 8, m + 8], [0, 1.15 / (dd * dd) > 3 ? 3 : 1.15 / (dd * dd)]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    if (d2(state) > 0) {
      plot.shade(g, null, m, m + 6, c.fillB);
      plot.fn(g, { color: c.a });
      plot.segment(m, 0, m, 10, { color: c.ink, width: 2, dash: [5, 4] });
      plot.point(m, 1 / (dd * dd), { fill: c.a, r: 6 });
    } else plot.text('d² ≤ 0: factorise instead', m, 0.2, { size: 12 });
  },
  controls: () => [
    { title: 'Reshape the denominator' },
    { key: 'b', label: 'b', min: -8, max: 8, step: 1 },
    { key: 'c', label: 'c', min: 1, max: 30, step: 1 },
    { readout: [
      ['Centre −b/2', (s) => fixed(-s.b / 2, 1)],
      ['d² = c − b²/4', (s) => ({ text: fixed(d2(s), 2), good: d2(s) > 0 })],
      ['Area, centre to centre + 6', (s) => (d2(s) > 0 ? fixed(exact(f(s), -s.b / 2, -s.b / 2 + 6), 5) : '—')],
      ['(1/d) arctan(6/d)', (s) => (d2(s) > 0 ? fixed((1 / Math.sqrt(d2(s))) * Math.atan(6 / Math.sqrt(d2(s))), 5) : '—')],
    ] },
  ],
  tex: (s) => (d2(s) > 0
    ? `x^2${s.b < 0 ? '' : '+'}${s.b}x+${s.c}=\\left(x${s.b / 2 < 0 ? '' : '+'}${fixed(s.b / 2, 1)}\\right)^2+${fixed(d2(s), 2)}`
    : 'd^2\\le0:\\ \\text{the quadratic factorises over the reals}'),
});

tool.update();
