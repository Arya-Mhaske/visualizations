import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { rectsOn, sumOn } from './_exp-log-math.js';

const state = { c: 3, N: 6, rule: 'midpoint' };
const RULES = { upper: 'Left ends (upper sum)', lower: 'Right ends (lower sum)', midpoint: 'Midpoints' };
const est = (s) => sumOn(1, s.c, s.N, s.rule);

createTool({
  state,
  label: 'Rectangles drawn under the curve one over x between 1 and c. The rectangles use the left ends, right ends or middles of their pieces. The sum of their areas estimates the natural log of c. Because the curve falls, left ends give an overestimate, right ends an underestimate and midpoints land very close.',
  setup: (stage, c) => createPlot(stage, { x: [0, 8.5], y: [0, 1.2], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => 1 / x, { color: c.ink, width: 4, domain: [0.8, 8.5] });
    for (const r of rectsOn(1, state.c, state.N, state.rule)) {
      plot.shade(() => r.h, null, r.x0, r.x1, c.fillA);
      plot.segment(r.x0, 0, r.x0, r.h, { color: c.ink, width: 2 });
      plot.segment(r.x1, 0, r.x1, r.h, { color: c.ink, width: 2 });
      plot.segment(r.x0, r.h, r.x1, r.h, { color: c.ink, width: 2 });
    }
    plot.fn((x) => 1 / x, { color: c.ink, width: 3, domain: [0.8, 8.5] });
  },
  controls: [
    { title: 'Add up rectangles' },
    { key: 'rule', label: 'Height taken at', options: Object.entries(RULES).map(([k, v]) => [k, v.split(' (')[0]]) },
    { key: 'c', label: 'c', min: 1.5, max: 8, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'N', label: 'Rectangles', min: 1, max: 100, step: 1 },
    { readout: [
      ['Estimate', (s) => ({ text: fixed(est(s), 5), good: Math.abs(est(s) - Math.log(s.c)) < 0.005 })],
      ['Lower sum', (s) => fixed(sumOn(1, s.c, s.N, 'lower'), 5)],
      ['Upper sum', (s) => fixed(sumOn(1, s.c, s.N, 'upper'), 5)],
      ['True ln c', (s) => fixed(Math.log(s.c), 5)],
      ['Error', (s) => fixed(est(s) - Math.log(s.c), 5)],
    ] },
  ],
  tex: (s) => `${fixed(sumOn(1, s.c, s.N, 'lower'), 4)}\\ \\le\\ \\ln ${fixed(s.c, 1)}\\ \\le\\ ${fixed(sumOn(1, s.c, s.N, 'upper'), 4)}`,
});
