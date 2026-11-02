import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from './_is.js';

// KE/mc² = γ − 1 = (1 − β²)^(−1/2) − 1 = ½β² + ⅜β⁴ + ⁵⁄₁₆β⁶ + ³⁵⁄₁₂₈β⁸ + …  (binomial series with k = −½, x = −β²)
const COEF = [1 / 2, 3 / 8, 5 / 16, 35 / 128];
const exact = (b) => 1 / Math.sqrt(1 - b * b) - 1;
const approx = (b, terms) => COEF.slice(0, terms).reduce((s, c, i) => s + c * b ** (2 * i + 2), 0);
const state = { beta: 0.3, terms: 1 };

createTool({
  state,
  label: 'Kinetic energy in units of m c squared against speed as a fraction of c. The exact curve (black) climbs to infinity at the speed of light. The classical half m v squared (coral) falls away from it as speed grows.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [0, 3], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'v / c', yLabel: 'KE / mc²' });
    plot.fn((b) => exact(Math.min(b, 0.9999)), { color: c.ink, width: 3, domain: [0, 0.9999] });
    plot.fn((b) => approx(b, state.terms), { color: c.a, width: 3 });
    plot.segment(state.beta, 0, state.beta, 3, { color: c.b, width: 2, dash: [5, 4] });
    plot.point(state.beta, Math.min(3, exact(state.beta)), { fill: c.ink, r: 5 });
    plot.point(state.beta, Math.min(3, approx(state.beta, state.terms)), { fill: c.a });
  },
  controls: [
    { title: 'Speed up' },
    { key: 'beta', label: 'Speed v/c', min: 0.01, max: 0.95, step: 0.01, format: (v) => v.toFixed(2) },
    { key: 'terms', label: 'Terms of the series', min: 1, max: 4, step: 1 },
    { readout: [
      ['Exact (γ − 1)', () => num(exact(state.beta), 5)],
      ['Series', () => num(approx(state.beta, state.terms), 5)],
      ['½ v²/c² alone', () => num(state.beta ** 2 / 2, 5)],
      ['Series is off by', () => `${(((exact(state.beta) - approx(state.beta, state.terms)) / exact(state.beta)) * 100).toFixed(3)}%`],
    ] },
  ],
  tex: (s) => `E=mc^2+\\tfrac12 mv^2+\\tfrac38\\,\\frac{mv^4}{c^2}+\\cdots\\quad(v/c=${s.beta.toFixed(2)})`,
});
