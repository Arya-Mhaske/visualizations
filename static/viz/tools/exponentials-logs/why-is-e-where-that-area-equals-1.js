import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { c: 2 };
const inv = (x) => 1 / x;
const hit = (s) => Math.abs(Math.log(s.c) - 1) < 0.0006;

createTool({
  state,
  label: 'The region under the curve one over x from 1 to c, shaded, beside a dashed unit square that has area exactly 1. Slide c until the shaded area reads 1. That happens at one special value of c, which is the number e.',
  setup: (stage, c) => createPlot(stage, { x: [0, 4.5], y: [0, 1.3], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.segment(0, 1, 1, 1, { color: c.c, width: 3, dash: [6, 5] });
    plot.text('area 1', 0.5, 0.45, { size: 11, color: c.c, patch: false });
    plot.shade(inv, null, 1, state.c, hit(state) ? c.fillC : c.fillA);
    plot.fn(inv, { color: c.ink, width: 4, domain: [0.12, 4.5] });
    plot.segment(state.c, 0, state.c, inv(state.c), { color: c.ink, width: 3 });
    plot.point(state.c, 0, { fill: c.fillY, r: 9 });
  },
  controls: (tool) => [
    { title: 'Drag c until the area is 1' },
    { key: 'c', label: 'c', min: 1, max: 4, step: 0.001, format: (v) => fixed(v, 3) },
    { button: 'Jump to the answer', onClick: () => { state.c = Math.E; tool.update(); } },
    { readout: [
      ['Shaded area, ln c', (s) => ({ text: fixed(Math.log(s.c), 4), good: hit(s) })],
      ['Area equals 1?', (s) => (hit(s) ? { text: 'yes, c is e', good: true } : { text: Math.log(s.c) < 1 ? 'too small' : 'too big', good: false })],
    ] },
  ],
  tex: (s) => `\\displaystyle\\int_1^{${fixed(s.c, 3)}}\\dfrac{dt}{t}=${fixed(Math.log(s.c), 4)}\\qquad e=${fixed(Math.E, 5)}`,
});
