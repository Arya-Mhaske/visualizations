import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { cloud, linearFit } from './_modelling-math.js';

const state = { slope: 1, noise: 1 };
let tool;
const data = (s = state) => cloud(9, 30, s.slope, s.noise);

tool = createTool({
  state,
  label: 'A cloud of thirty points scattered about a straight line, with the best-fit line drawn. The correlation coefficient r says how tightly the points hug the line, not how steep the line is. A steep line with a lot of scatter can have a lower r than a nearly flat line with hardly any scatter. Buttons give examples: steep and messy, flat and tidy.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 5], y: [-10, 10], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const pts = data();
    const fit = linearFit(pts);
    plot.fn((x) => fit.m * x + fit.b, { color: c.a, width: 3 });
    pts.forEach(([x, y]) => plot.point(x, y, { fill: c.b, r: 5 }));
  },
  controls: [
    { title: 'Shape the cloud' },
    { row: [
      { button: 'Steep and messy', ghost: true, onClick: () => { Object.assign(state, { slope: 2, noise: 4 }); tool.update(); } },
      { button: 'Flat and tidy', ghost: true, onClick: () => { Object.assign(state, { slope: 0.2, noise: 0.2 }); tool.update(); } },
    ] },
    { key: 'slope', label: 'Steepness of the trend', min: -2, max: 2, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'noise', label: 'Scatter about it', min: 0.1, max: 5, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['r', (s) => ({ text: fixed(linearFit(data(s)).r, 3), good: Math.abs(linearFit(data(s)).r) > 0.9 })],
      ['Slope of the fitted line', (s) => fixed(linearFit(data(s)).m, 3)],
      ['How tightly packed', (s) => (Math.abs(linearFit(data(s)).r) > 0.9 ? 'very tight' : Math.abs(linearFit(data(s)).r) > 0.6 ? 'loose' : 'hardly a line')],
    ] },
  ],
  tex: (s) => `r=${fixed(linearFit(data(s)).r, 3)}\\quad(-1\\le r\\le1)`,
});
