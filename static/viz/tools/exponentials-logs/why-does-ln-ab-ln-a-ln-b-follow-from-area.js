import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { a: 2, b: 3, s: 0.5 };
const inv = (x) => 1 / x;
const lambda = (st) => st.a ** st.s;
const CHORDS = 9;

createTool({
  state,
  label: 'The region under one over x from 1 to b, in blue outline, is stretched sideways by a factor lambda and squashed down by the same factor. The stretched region, in coral, always sits exactly under the same curve, and its area never changes. At full stretch lambda equals a, and it lands on the interval from a to a times b.',
  setup: (stage, c) => createPlot(stage, { x: [0, 8], y: [0, 1.3], c }),
  draw(ctx, stage, c, plot) {
    const { a, b } = state;
    const l = lambda(state);
    plot.setRange([0, a * b * 1.12], [0, 1.25]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(inv, null, l, l * b, c.fillA);
    plot.shade(inv, null, 1, a, c.fillB);
    plot.fn(inv, { color: c.ink, width: 4, domain: [0.6, a * b * 1.12] });
    for (let i = 0; i < CHORDS; i++) {
      const x = 1 + ((b - 1) * (i + 0.5)) / CHORDS;
      plot.segment(x, 0, x, inv(x), { color: c.b, width: 1 });
      plot.segment(l * x, 0, l * x, inv(l * x), { color: c.a, width: 2 });
    }
    plot.segment(l, 0, l, inv(l), { color: c.ink, width: 3 });
    plot.segment(l * b, 0, l * b, inv(l * b), { color: c.ink, width: 3 });
    plot.text(`ln a`, (1 + a) / 2, 0.08, { size: 10, patch: false });
  },
  controls: [
    { title: 'Stretch the region' },
    { key: 'a', label: 'a', min: 1.5, max: 4, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'b', label: 'b', min: 1.5, max: 4, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 's', label: 'Stretch progress', min: 0, max: 1, step: 0.02, format: (v) => `${Math.round(v * 100)}%` },
    { readout: [
      ['Stretch λ', (s) => fixed(lambda(s), 3)],
      ['Squash 1/λ', (s) => fixed(1 / lambda(s), 3)],
      ['Region now spans', (s) => `${fixed(lambda(s), 2)} to ${fixed(lambda(s) * s.b, 2)}`],
      ['Area, always ln b', (s) => ({ text: fixed(Math.log(lambda(s) * s.b) - Math.log(lambda(s)), 4), good: true })],
    ] },
  ],
  tex: (s) => `\\ln(ab)=\\underbrace{\\ln a}_{[1,a]}+\\underbrace{\\ln b}_{[a,ab]}=${fixed(Math.log(s.a), 3)}+${fixed(Math.log(s.b), 3)}=${fixed(Math.log(s.a * s.b), 3)}`,
});
