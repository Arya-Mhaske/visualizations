import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sci, texSci, fixed } from '../../lib/format.js';
import { lastLead } from './_exp-log-math.js';

const state = { p: 10, xmax: 70 };
const L2 = Math.log10(2);

createTool({
  state,
  label: 'A race between two growing numbers, 2 to the power x and x to the power p, drawn on an axis that counts digits so both fit. The doubling line is straight and keeps climbing; the power curve rises fast then bends over. A dot marks where doubling finally overtakes for good.',
  setup: (stage, c) => createPlot(stage, { x: [0, 70], y: [0, 25], c }),
  draw(ctx, stage, c, plot) {
    const top = Math.max(state.xmax * L2, state.p * Math.log10(state.xmax)) * 1.1;
    plot.setRange([0, state.xmax], [0, top]);
    plot.axes({ xLabel: 'x', yLabel: 'digits' });
    plot.fn((x) => (x <= 0 ? NaN : state.p * Math.log10(x)), { color: c.b, width: 4, domain: [0.05, state.xmax] });
    plot.fn((x) => x * L2, { color: c.a, width: 4 });
    const lead = lastLead(state.p);
    if (lead < state.xmax) {
      plot.segment(lead, 0, lead, lead * L2, { color: c.grid, width: 2, dash: [4, 4] });
      plot.point(lead, lead * L2, { fill: c.fillY, r: 8 });
    }
    plot.text('2ˣ', state.xmax * 0.92, state.xmax * 0.92 * L2 + top * 0.06, { color: c.a });
    plot.text(`x^${state.p}`, state.xmax * 0.25, state.p * Math.log10(state.xmax * 0.25) + top * 0.06, { color: c.b });
  },
  controls: [
    { title: 'Run the race' },
    { key: 'p', label: 'Power p', min: 2, max: 10, step: 1 },
    { key: 'xmax', label: 'Run to x =', min: 5, max: 100, step: 1 },
    { readout: [
      ['2ˣ', (s) => sci(2 ** s.xmax, 2)],
      ['xᵖ', (s) => sci(s.xmax ** s.p, 2)],
      ['Doubling passes at', (s) => (lastLead(s.p) < s.xmax ? `x ≈ ${fixed(lastLead(s.p), 1)}` : 'not yet')],
      ['Leader now', (s) => (2 ** s.xmax > s.xmax ** s.p ? { text: '2ˣ', good: true } : { text: 'xᵖ', good: false })],
    ] },
  ],
  tex: (s) => `2^{${s.xmax}}=${texSci(2 ** s.xmax, 3)}\\qquad ${s.xmax}^{${s.p}}=${texSci(s.xmax ** s.p, 3)}`,
});
