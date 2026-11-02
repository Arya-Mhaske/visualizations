import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig } from '../../lib/format.js';

const E = [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.001];
const state = { i: 2 };
const e = (s) => E[s.i];
const f = (v) => sig(v, 3).replace('-', '−');

createTool({
  state,
  label: 'The graph of six divided by x, with two points at plus and minus the same small distance from zero. The points climb and fall off the chart as the distance shrinks.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-30, 30], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: '6 ÷ x' });
    plot.fn((x) => 6 / x, { color: c.b });
    const [r, l] = [6 / e(state), -6 / e(state)];
    [[e(state), r, c.a], [-e(state), l, c.c]].forEach(([x, y, col]) => {
      if (Math.abs(y) <= 30) plot.point(x, y, { fill: col });
      else plot.text(y > 0 ? '↑ off the chart' : '↓ off the chart', x, y > 0 ? 27 : -27, { align: x > 0 ? 'left' : 'right', patch: false });
    });
  },
  controls: [
    { title: 'Close in on 0' },
    { key: 'i', label: 'Step towards 0', min: 0, max: E.length - 1, step: 1, format: (v) => `x = ±${E[v]}` },
    { readout: [
      ['From the right', (s) => `6 ÷ ${e(s)} = ${f(6 / e(s))}`],
      ['From the left', (s) => `6 ÷ (−${e(s)}) = ${f(-6 / e(s))}`],
      ['n × 0', () => 'always 0, never 6'],
    ] },
  ],
  tex: (s) => `\\dfrac{6}{${e(s)}}=${f(6 / e(s))}\\qquad \\dfrac{6}{-${e(s)}}=${f(-6 / e(s))}`,
});
