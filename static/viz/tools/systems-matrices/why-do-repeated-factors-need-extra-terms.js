import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { facTex, linTex, pfRepeated } from './_sm-math.js';

// (m x + n)/(x − p)² . A single term A/(x − p) cannot match it for any A. Two terms A/(x − p) + B/(x − p)² can.
const state = { m: 2, n: 1, p: 1, a: 2 };
const whole = (s) => (x) => (s.m * x + s.n) / (x - s.p) ** 2;
const truth = (s) => pfRepeated(s.m, s.n, s.p);
const attempt = (s) => (x) => s.a / (x - s.p);
const mismatch = (s) => { let w = 0; for (let x = -5.9; x < 6; x += 0.2) if (Math.abs(x - s.p) > 0.4) w = Math.max(w, Math.abs(whole(s)(x) - attempt(s)(x))); return w; };

createTool({
  state,
  label: 'The graph of a fraction whose denominator is a squared factor, and an attempt to match it with a single piece A over the factor. Whatever the value of A, the single piece cannot follow the original graph: they differ near the pole and far away. Adding a second piece over the squared factor, with the right coefficient, matches exactly.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-8, 8], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const { A, B } = truth(state);
    plot.axes();
    plot.fn(whole(state), { color: c.ink, width: 5 });
    plot.fn(attempt(state), { color: c.a, width: 4 });
    plot.fn((x) => A / (x - state.p) + B / (x - state.p) ** 2, { color: c.c, width: 3, dash: [6, 6] });
    plot.segment(state.p, -8, state.p, 8, { color: c.grid, width: 1, dash: [4, 4] });
  },
  controls: [
    { title: 'Try to match it' },
    { key: 'a', label: 'Your single term A/(x − p), A', min: -4, max: 4, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'm', label: 'Numerator: coefficient of x', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'n', label: 'Numerator: constant', min: -4, max: 4, step: 1, format: (n) => `${n}` },
    { key: 'p', label: 'Repeated factor (x − p), p', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Biggest gap with one term', (s) => ({ text: fixed(mismatch(s), 3), good: mismatch(s) < 0.01 })],
      ['The right pieces', (s) => `A = ${fixed(truth(s).A, 2)}, B = ${fixed(truth(s).B, 2)}`],
      ['Gap with both terms', () => ({ text: '0', good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{${linTex(s.m, s.n)}}{(${facTex(s.p)})^2}=\\dfrac{${fixed(truth(s).A, 2)}}{${facTex(s.p)}}+\\dfrac{${fixed(truth(s).B, 2)}}{(${facTex(s.p)})^2}`,
});
