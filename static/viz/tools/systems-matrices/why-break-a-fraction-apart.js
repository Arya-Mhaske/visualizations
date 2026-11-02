import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { facTex, linTex, pfLinear } from './_sm-math.js';

// (m x + n) / ((x − p)(x − q)) = A/(x − p) + B/(x − q): adding the two pieces over a common denominator gives back the whole.
const state = { m: 3, n: 5, p: -1, q: -2, show: true };
const whole = (s) => (x) => (s.m * x + s.n) / ((x - s.p) * (x - s.q));
const parts = (s) => pfLinear(s.m, s.n, s.p, s.q);
const sameRoots = (s) => s.p === s.q;
const gap = (s) => { const { A, B } = parts(s); let worst = 0; for (let x = -5.97; x < 6; x += 0.17) { if (Math.abs(x - s.p) < 0.05 || Math.abs(x - s.q) < 0.05) continue; worst = Math.max(worst, Math.abs(whole(s)(x) - (A / (x - s.p) + B / (x - s.q)))); } return worst; };

createTool({
  state,
  label: 'The graph of a fraction with two linear factors in its denominator, drawn in black, and the graphs of its two simple pieces, one over each factor. The dashed curve is the sum of the two pieces. It lies exactly on top of the original fraction, because the pieces added together over a common denominator give the original fraction back.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-6, 6], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    if (sameRoots(state)) return;
    const { A, B } = parts(state);
    if (state.show) {
      plot.fn((x) => A / (x - state.p), { color: c.a, width: 3 });
      plot.fn((x) => B / (x - state.q), { color: c.b, width: 3 });
    }
    plot.fn(whole(state), { color: c.ink, width: 5 });
    plot.fn((x) => A / (x - state.p) + B / (x - state.q), { color: c.d, width: 3, dash: [6, 6] });
    plot.segment(state.p, -6, state.p, 6, { color: c.grid, width: 1, dash: [4, 4] });
    plot.segment(state.q, -6, state.q, 6, { color: c.grid, width: 1, dash: [4, 4] });
  },
  controls: [
    { title: 'Pick a fraction' },
    { key: 'm', label: 'Numerator: coefficient of x', min: -4, max: 4, step: 1, format: (n) => `${n}` },
    { key: 'n', label: 'Numerator: constant', min: -6, max: 6, step: 1, format: (n) => `${n}` },
    { key: 'p', label: 'First factor (x − p), p', min: -4, max: 4, step: 1, format: (n) => `${n}` },
    { key: 'q', label: 'Second factor (x − q), q', min: -4, max: 4, step: 1, format: (n) => `${n}` },
    { key: 'show', label: 'Show the two pieces', toggle: true },
    { readout: [
      ['A and B', (s) => (sameRoots(s) ? 'p = q: a repeated factor, see the next tool' : `${fixed(parts(s).A, 3)}, ${fixed(parts(s).B, 3)}`)],
      ['Biggest gap between whole and sum', (s) => (sameRoots(s) ? '—' : { text: fixed(gap(s), 9), good: true })],
    ] },
  ],
  tex: (s) => (sameRoots(s) ? '\\text{choose two different factors}' : `\\dfrac{${linTex(s.m, s.n)}}{(${facTex(s.p)})(${facTex(s.q)})}=\\dfrac{${fixed(parts(s).A, 3)}}{${facTex(s.p)}}+\\dfrac{${fixed(parts(s).B, 3)}}{${facTex(s.q)}}`),
});
