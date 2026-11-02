import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, num } from '../integral-applications/_ia.js';

// A(b) = ∫₁ᵇ x^(−p) dx. For p = 2: 1 − 1/b, which stalls at 1. For p = 1: ln b, which never stops.
const state = { s: 1, p: 2 };
const b = () => 10 ** state.s;
const A = (bb, p = state.p) => (p === 1 ? Math.log(bb) : (1 - bb ** (1 - p)) / (p - 1));
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: the curve one over x to the p with the area from 1 out to b shaded. Bottom: the area so far against the log of b. For p = 2 it flattens at 1; for p = 1 it climbs for ever.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [0, 10], y: [0, 1.2], c, box: bA }), b: createPlot(stage, { x: [0, 6], y: [0, 15], c, box: bB }) }),
  draw(ctx, stage, c, { a, b: pb }) {
    const X = Math.min(b(), 12);
    a.setRange([0, 12], [0, 1.2]);
    a.axes({ xLabel: 'x', yLabel: 'y' });
    a.shade((x) => x ** -state.p, null, 1, X, c.fillB);
    a.fn((x) => x ** -state.p, { color: c.ink, width: 3, domain: [0.5, 12] });
    a.segment(b() > 12 ? 12 : b(), 0, b() > 12 ? 12 : b(), 1.2, { color: c.a, width: 2 });
    pb.setRange([0, 6], [0, Math.max(3, A(1e6, 1) * 1.1)]);
    pb.axes({ xLabel: 'log₁₀ b', yLabel: 'area from 1 to b' });
    pb.fn((s) => A(10 ** s, 2), { color: c.b, width: 3 });
    pb.fn((s) => A(10 ** s, 1), { color: c.a, width: 3 });
    pb.fn((s) => A(10 ** s, state.p), { color: c.c, width: 2, dash: [5, 4] });
    pb.point(state.s, A(b()), { fill: c.c, r: 6 });
  },
  controls: [
    { title: 'Extend the right end' },
    { key: 'p', label: 'Curve 1/xᵖ', options: [[2, 'p = 2'], [1, 'p = 1']] },
    { key: 's', label: 'Right end b = 10^s', min: 0, max: 6, step: 0.1, format: (v) => `b = ${num(10 ** v, 6)}` },
    { readout: [
      ['Area from 1 to b', () => num(A(b()), 6)],
      ['Where it is heading', () => (state.p === 2 ? { text: 'stalls at 1', good: true } : { text: 'ln b: no limit', good: false })],
      ['Gap to the limit (p = 2)', () => num(1 / b(), 4)],
    ] },
  ],
  tex: (s) => (s.p === 2 ? `\\int_1^{b}\\frac{dx}{x^2}=1-\\frac1b\\to1` : `\\int_1^{b}\\frac{dx}{x}=\\ln b\\to\\infty`),
});
