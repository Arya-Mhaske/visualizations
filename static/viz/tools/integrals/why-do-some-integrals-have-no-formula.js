import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact, stackBoxes } from './_ig.js';

// ∫ e^(−x²) dx exists as a smooth area function, but no combination of x, e^x, ln, sin... differentiates to it.
// Try plausible guesses: each one's slope is plotted against the real integrand.
const f = (x) => Math.exp(-x * x);
const A = (x) => exact(f, 0, x);
const d = (g, x, h = 1e-5) => (g(x + h) - g(x - h)) / (2 * h);
const GUESSES = {
  a: ['x e^(−x²)', (x) => x * Math.exp(-x * x)],
  b: ['−e^(−x²)/(2x)', (x) => -Math.exp(-x * x) / (2 * x)],
  c: ['−e^(−x²)', (x) => -Math.exp(-x * x)],
  d: ['area function A(x)', A],
};
const state = { g: 'a', x: 1 };

const tool = createTool({
  state,
  label: 'Top: the curve e to the minus x squared with the area from 0 to x shaded. Bottom: the slope of a guessed antiderivative drawn against the real curve. Guesses made from familiar functions have slopes that do not match. Only the area function matches, and it is not a formula we can write with familiar functions.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [-3, 3], y: [-0.2, 1.2], c, pad: 24, box: stackBoxes(2)[0] }),
    bottom: createPlot(stage, { x: [-3, 3], y: [-1.5, 1.5], c, pad: 24, box: stackBoxes(2)[1] }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    const G = GUESSES[state.g][1];
    top.axes({ xLabel: 'x', yLabel: 'e^(−x²)' });
    top.shade(f, null, 0, state.x, c.fillB);
    top.fn(f, { color: c.a });
    bottom.axes({ xLabel: 'x', yLabel: 'slope of guess' });
    bottom.fn(f, { color: c.a, width: 2, dash: [6, 4] });
    bottom.fn((x) => d(G, x), { color: c.c, width: 3, domain: [-3, 3] });
  },
  controls: () => [
    { title: 'Guess an antiderivative' },
    { key: 'g', label: 'Guess G(x)', options: Object.entries(GUESSES).map(([k, v]) => [k, v[0]]) },
    { key: 'x', label: 'Area up to x', min: 0, max: 3, step: 0.05, format: (v) => fixed(v, 2) },
    { readout: [
      ['Real integrand', (s) => fixed(f(s.x + 0.0001), 4)],
      ['Slope of the guess', (s) => fixed(d(GUESSES[s.g][1], s.x + 0.0001), 4)],
      ['Match?', (s) => ({ text: Math.abs(d(GUESSES[s.g][1], s.x + 0.0001) - f(s.x + 0.0001)) < 1e-3 ? 'yes' : 'no', good: Math.abs(d(GUESSES[s.g][1], s.x + 0.0001) - f(s.x + 0.0001)) < 1e-3 })],
      ['Area 0 to x', (s) => fixed(A(s.x), 5)],
      ['Total area, −∞ to ∞', () => `√π = ${fixed(Math.sqrt(Math.PI), 5)}`],
    ] },
  ],
  tex: () => '\\int_{-\\infty}^{\\infty}e^{-x^2}\\,dx=\\sqrt{\\pi},\\quad\\int e^{-x^2}\\,dx\\ \\text{has no elementary form}',
});

tool.update();
