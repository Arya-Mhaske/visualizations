import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { deriv, stackBoxes, tangent } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

// y = x^x. Taking ln first gives ln y = x ln x, a product the product rule handles: (ln y)' = ln x + 1 = y'/y.
const state = { x: 1.5 };
const y = (x) => x ** x;
const lny = (x) => x * Math.log(x);
const slopeLn = (x) => Math.log(x) + 1;

createTool({
  state,
  label: 'Two graphs, one above the other. The top is y equals x to the x. The bottom is the natural log of y, which is x times natural log x. The slope of the bottom graph is natural log x plus 1, and multiplying it by y gives the slope of the top graph.',
  setup: (stage, c) => {
    const [top, bottom] = stackBoxes(2);
    return [
      createPlot(stage, { x: [0, 2.5], y: [0, 10], c, pad: 20, box: top }),
      createPlot(stage, { x: [0, 2.5], y: [-1, 3], c, pad: 20, box: bottom }),
    ];
  },
  draw(ctx, stage, c, [upper, lower]) {
    const { x } = state;
    upper.axes({ xLabel: 'x', yLabel: 'y' });
    upper.fn(y, { color: c.a, width: 4, domain: [0.02, 2.5] });
    tangent(upper, x, y(x), deriv(y, x), 0.4, { color: c.ink, width: 3 });
    upper.point(x, y(x), { fill: c.fillY });
    upper.text('y = xˣ', 0.45, 8.6, { size: 12, color: c.a, patch: false });
    lower.axes({ xLabel: 'x', yLabel: 'ln y' });
    lower.fn(lny, { color: c.b, width: 4, domain: [0.02, 2.5] });
    tangent(lower, x, lny(x), slopeLn(x), 0.6, { color: c.ink, width: 3 });
    lower.point(x, lny(x), { fill: c.fillY });
    lower.text('ln y = x ln x', 1.0, 2.5, { size: 12, color: c.b, patch: false });
  },
  controls: [
    { title: 'Take ln first' },
    { key: 'x', label: 'x', min: 0.1, max: 2.4, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['Slope of ln y = ln x + 1', (s) => fixed(slopeLn(s.x), 4)],
      ['y = xˣ', (s) => fixed(y(s.x), 4)],
      ['y′ = xˣ (ln x + 1)', (s) => ({ text: fixed(y(s.x) * slopeLn(s.x), 4), good: true })],
      ['Slope of xˣ (measured)', (s) => fixed(deriv(y, s.x), 4)],
    ] },
  ],
  tex: (s) => `\\ln y=x\\ln x\\ \\Rightarrow\\ \\dfrac{y'}{y}=\\ln x+1\\ \\Rightarrow\\ y'=x^x(\\ln x+1)=${fixed(y(s.x) * slopeLn(s.x), 3)}`,
});
