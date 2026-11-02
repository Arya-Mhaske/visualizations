import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from './_ig.js';

// Strategy for ∫ sin^m x cos^n x dx. Value over [0, π/2] by the double-factorial rule, checked against Simpson.
const state = { m: 3, n: 2 };
const df = (k) => { let r = 1; for (let i = k; i > 1; i -= 2) r *= i; return r; };
export const wallis = (m, n) => ((df(m - 1) * df(n - 1)) / df(m + n)) * (m % 2 === 0 && n % 2 === 0 ? Math.PI / 2 : 1);
const strategy = (m, n) => {
  if (m % 2 === 1) return `m = ${m} is odd: save one sin x for du, turn the other sin² into 1 − cos², and let u = cos x.`;
  if (n % 2 === 1) return `n = ${n} is odd: save one cos x for du, turn the other cos² into 1 − sin², and let u = sin x.`;
  return 'Both powers are even: use sin²x = (1 − cos 2x)/2 and cos²x = (1 + cos 2x)/2 until only odd powers remain.';
};

const tool = createTool({
  state,
  label: 'A graph of sine to the power m times cosine to the power n from 0 to pi over 2, with the area shaded. A sentence below the controls names the strategy that fits the powers.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1.7], y: [0, 1.05], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const f = (x) => Math.sin(x) ** state.m * Math.cos(x) ** state.n;
    plot.axes({ xLabel: 'x', yLabel: 'sinᵐ x cosⁿ x' });
    plot.shade(f, null, 0, Math.PI / 2, c.fillB);
    plot.fn(f, { color: c.a });
  },
  controls: () => [
    { title: 'Choose the powers' },
    { key: 'm', label: 'Power of sin, m', min: 0, max: 6, step: 1 },
    { key: 'n', label: 'Power of cos, n', min: 0, max: 6, step: 1 },
    { text: 'Strategy is shown in the readout below.' },
    { readout: [
      ['Odd power?', (s) => (s.m % 2 === 1 ? 'm is odd → u = cos x' : s.n % 2 === 1 ? 'n is odd → u = sin x' : 'both even → half-angle')],
      ['Value 0 to π/2 (rule)', (s) => fixed(wallis(s.m, s.n), 5)],
      ['Value (by slices)', (s) => fixed(exact((x) => Math.sin(x) ** s.m * Math.cos(x) ** s.n, 0, Math.PI / 2), 5)],
    ] },
  ],
  tex: (s) => (s.m % 2 === 1 ? `\\int\\sin^{${s.m}}x\\cos^{${s.n}}x\\,dx=\\int(1-u^2)^{${(s.m - 1) / 2}}u^{${s.n}}(-du)` : s.n % 2 === 1 ? `\\int\\sin^{${s.m}}x\\cos^{${s.n}}x\\,dx=\\int u^{${s.m}}(1-u^2)^{${(s.n - 1) / 2}}du` : `\\int\\sin^{${s.m}}x\\cos^{${s.n}}x\\,dx\\ \\text{via}\\ \\sin^2x=\\tfrac{1-\\cos2x}{2}`),
});
void strategy;

tool.update();
