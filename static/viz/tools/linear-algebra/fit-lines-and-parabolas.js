import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { evalPoly, polyFitLS } from './_la-math.js';

// Made-up measurements, so the page can show what each model does to them.
const SETS = {
  ball: { name: 'A thrown ball', pts: [[0, 0.9], [0.5, 3.1], [1, 4.3], [1.5, 4.6], [2, 4.2], [2.5, 3.0], [3, 0.8]], x: [-0.3, 3.3], y: [-1, 6] },
  line: { name: 'Nearly a line', pts: [[0, 1.2], [1, 2.9], [2, 5.2], [3, 6.8], [4, 9.1], [5, 10.8]], x: [-0.3, 5.3], y: [-1, 13] },
  bend: { name: 'An S-bend', pts: [[0, 0.2], [1, 1.6], [2, 2.0], [3, 2.1], [4, 2.6], [5, 4.1], [6, 6.4]], x: [-0.3, 6.3], y: [-1, 8] },
};
const state = { set: 'ball', degree: 2 };
const fit = (s, d) => polyFitLS(SETS[s.set].pts, d);
const rms = (s, d) => { const f = fit(s, d); const r = SETS[s.set].pts.map(([t, y]) => y - evalPoly(f, t)); return Math.sqrt(r.reduce((a, v) => a + v * v, 0) / r.length); };
const eq = (s) => fit(s, s.degree).map((v, k) => `${fixed(v, 2)}${k ? `t${k > 1 ? `^${k}` : ''}` : ''}`).join(' + ');

createTool({
  state,
  label: 'A small set of measurements with the best-fit curve of the chosen degree: a straight line, a parabola or a cubic. Each curve is the least squares fit, so its total squared error is as small as that kind of curve can make it. The readout lists the typical error for all three.',
  setup: (stage, c) => createPlot(stage, { x: [-0.3, 3.3], y: [-1, 6], c, pad: 24 }),
  draw(ctx, stage, c, plot) {
    const set = SETS[state.set];
    plot.setRange(set.x, set.y);
    plot.axes({ xLabel: 't', yLabel: 'y' });
    const f = fit(state, state.degree);
    plot.fn((t) => evalPoly(f, t), { color: c.a, width: 4, domain: set.x });
    set.pts.forEach(([t, y]) => {
      plot.segment(t, y, t, evalPoly(f, t), { color: c.d, width: 3 });
      plot.point(t, y, { fill: c.fillY, r: 6 });
    });
  },
  controls: [
    { title: 'Choose a model' },
    { key: 'set', label: 'Data', options: Object.entries(SETS).map(([key, v]) => [key, v.name]) },
    { key: 'degree', label: 'Model', options: [[1, 'Line'], [2, 'Parabola'], [3, 'Cubic']] },
    { readout: [
      ['Typical error: line', (s) => fixed(rms(s, 1), 3)],
      ['Typical error: parabola', (s) => fixed(rms(s, 2), 3)],
      ['Typical error: cubic', (s) => fixed(rms(s, 3), 3)],
      ['Number of data points', (s) => String(SETS[s.set].pts.length)],
    ] },
  ],
  tex: (s) => `y\\approx ${eq(s)}`,
});
