import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { deriv, direction } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

const state = { x: 3 };

createTool({
  state,
  label: 'The curves y equals e to the x and y equals natural log x, mirror images in the line y equals x. At x on the log curve, the mirror point on the exponential has slope x. Folding swaps rise and run, so the log curve has slope one over x.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 7], y: [-2, 7], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const { x } = state;
    const L = Math.log(x);
    plot.axes();
    plot.segment(-2, -2, 7, 7, { color: c.grid, width: 2, dash: [6, 5] });
    plot.fn(Math.exp, { color: c.a, width: 4 });
    plot.fn(Math.log, { color: c.b, width: 4, domain: [0.02, 7] });
    plot.segment(x, L, L, x, { color: c.grid, width: 2, dash: [3, 4] });
    // on e^x at (L, x): slope x, so run 1 and rise x
    direction(plot, L, x, 1, x, 0.7, { color: c.ink, width: 3 });
    plot.segment(L, x, L + 1, x, { color: c.a, width: 4 });
    plot.segment(L + 1, x, L + 1, 2 * x, { color: c.a, width: 4 });
    // on ln at (x, L): rise 1 and run x
    direction(plot, x, L, x, 1, 0.7, { color: c.ink, width: 3 });
    plot.segment(x, L, x, L + 1, { color: c.b, width: 4 });
    plot.segment(x, L + 1, 2 * x, L + 1, { color: c.b, width: 4 });
    plot.point(L, x, { fill: c.fillY });
    plot.point(x, L, { fill: c.fillY });
    plot.text('rise x, run 1', L + 1.1, x * 1.5, { size: 10, color: c.a, align: 'left', patch: false });
    plot.text('rise 1, run x', x * 1.5, L + 1.3, { size: 10, color: c.b, align: 'left', patch: false });
  },
  controls: [
    { title: 'Mirror a point' },
    { key: 'x', label: 'x on the ln curve', min: 0.3, max: 3.4, step: 0.1, format: (n) => fixed(n, 1) },
    { readout: [
      ['Mirror point on eˣ', (s) => `(${fixed(Math.log(s.x), 3)}, ${fixed(s.x, 1)})`],
      ['Slope of eˣ there', (s) => fixed(deriv(Math.exp, Math.log(s.x)), 3)],
      ['Slope of ln x (measured)', (s) => fixed(deriv(Math.log, s.x), 4)],
      ['1 ÷ x', (s) => ({ text: fixed(1 / s.x, 4), good: true })],
    ] },
  ],
  tex: (s) => `(\\ln x)'=\\dfrac{1}{(e^{y})'}=\\dfrac{1}{e^{y}}=\\dfrac{1}{x}=\\dfrac{1}{${fixed(s.x, 1)}}=${fixed(1 / s.x, 4)}`,
});
