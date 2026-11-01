import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { logb } from './_exp-log-math.js';

const state = { b: 2, t: -1 };
const zero = (t) => Math.abs(t) < 1e-9;

createTool({
  state,
  label: 'The graph of b to the power y, with a horizontal line at the number t you want a logarithm of. The logarithm is the exponent y where the curve meets the line. For t above zero they meet. For t of zero or less the line is on or under the curve everywhere and they never meet.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-3, 8], c }),
  draw(ctx, stage, c, plot) {
    const { b, t } = state;
    plot.axes({ xLabel: 'y (the exponent)', yLabel: 'bʸ' });
    plot.fn((y) => b ** y, { color: c.a, width: 4 });
    plot.segment(-6, t, 6, t, { color: c.b, width: 3 });
    plot.text(`t = ${fixed(t, 1)}`, -5.8, t + 0.7, { size: 11, align: 'left', patch: false, color: c.b });
    if (t > 0) {
      const y = logb(b, t);
      plot.segment(y, 0, y, t, { color: c.ink, width: 2, dash: [4, 4] });
      plot.point(y, t, { fill: c.fillY, r: 9 });
    }
  },
  controls: [
    { title: 'Look for an exponent' },
    { key: 'b', label: 'Base b', options: [[2, '2'], [3, '3'], [10, '10']] },
    { key: 't', label: 'Number t', min: -3, max: 8, step: 0.1 },
    { readout: [
      ['Exponent found', (s) => (s.t > 0 ? { text: fixed(logb(s.b, s.t), 3), good: true } : { text: 'none exists', good: false })],
      ['Lowest the curve gets', (s) => `${(s.b ** -6).toExponential(1)}, still above 0`],
    ] },
  ],
  tex: (s) => (s.t > 0
    ? `${s.b}^{${fixed(logb(s.b, s.t), 3)}}=${fixed(s.t, 1)}\\iff\\log_{${s.b}}${fixed(s.t, 1)}=${fixed(logb(s.b, s.t), 3)}`
    : `${s.b}^{y}=${zero(s.t) ? '0' : fixed(s.t, 1)}\\ \\text{has no solution, since}\\ ${s.b}^{y}>0`),
});
