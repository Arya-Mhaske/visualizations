import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { deriv, tangent } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

const state = { a: 2, x: 1 };

createTool({
  state,
  label: 'The graph of a to the x with its tangent. Writing a to the x as e to the power x times natural log a shows it is the graph of e to the x stretched sideways by the number natural log a, so its slope is itself times natural log a.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 3], y: [-1, 12], c, pad: 20 }),
  draw(ctx, stage, c, plot) {
    const { a, x } = state;
    const f = (t) => a ** t;
    plot.axes();
    plot.fn(Math.exp, { color: c.grid, width: 2, dash: [6, 5] });
    plot.fn(f, { color: c.a, width: 4 });
    tangent(plot, x, f(x), deriv(f, x), 0.6, { color: c.ink, width: 4 });
    tangent(plot, 0, 1, Math.log(a), 0.6, { color: c.b, width: 3, dash: [5, 4] });
    plot.point(0, 1, { fill: c.fillB, r: 5 });
    plot.point(x, f(x), { fill: c.fillY });
  },
  controls: (tool) => [
    { title: 'Change the base' },
    { key: 'a', label: 'Base a', min: 1.2, max: 4, step: 0.1, format: (n) => fixed(n, 2) },
    { key: 'x', label: 'Point x', min: -1.5, max: 2, step: 0.05, format: (n) => fixed(n, 2) },
    { row: [{ button: 'Set a = e', onClick() { state.a = Math.E; tool.update(); } }] },
    { readout: [
      ['Slope at x (measured)', (s) => fixed(deriv((t) => s.a ** t, s.x), 4)],
      ['Height aˣ', (s) => fixed(s.a ** s.x, 4)],
      ['Slope ÷ height', (s) => fixed(deriv((t) => s.a ** t, s.x) / s.a ** s.x, 4)],
      ['ln a', (s) => ({ text: fixed(Math.log(s.a), 4), good: true })],
    ] },
  ],
  tex: (s) => `(a^x)'=\\left(e^{x\\ln a}\\right)'=a^x\\ln a=${fixed(s.a ** s.x, 3)}\\times${fixed(Math.log(s.a), 3)}=${fixed(s.a ** s.x * Math.log(s.a), 3)}`,
});
