import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { phi, Phi, num } from './_ia.js';

// Histogram of a bell-shaped quantity. Bar height = (share in the bin) ÷ bin width, so each bar's AREA is the share. As bins shrink, the bars trace a smooth density curve.
// Shares are computed exactly from the normal curve (mean 170, sd 8 cm: made-up heights), not sampled.
const MU = 170; const SD = 8;
const cdf = (x) => Phi((x - MU) / SD);
const pdf = (x) => phi((x - MU) / SD) / SD;
const state = { w: 8, a: 165, b: 180 };
const bars = () => { const out = []; for (let x = 130; x < 210; x += state.w) out.push([x, x + state.w, cdf(x + state.w) - cdf(x)]); return out; };
const inRange = () => cdf(state.b) - cdf(state.a);

createTool({
  state,
  label: 'A histogram of heights whose bars have area equal to the share in each bin, with a smooth bell curve over it. A shaded stretch between two heights is a probability. As the bins narrow, the bars and the curve agree.',
  setup: (stage, c) => createPlot(stage, { x: [130, 210], y: [0, 0.06], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'height (cm)', yLabel: 'share per cm (density)' });
    for (const [x0, x1, share] of bars()) {
      const [px0, py] = plot.toPx(x0, share / state.w); const [px1, py0] = plot.toPx(x1, 0);
      const mid = (x0 + x1) / 2;
      ctx.fillStyle = mid >= state.a && mid <= state.b ? c.fillA : c.fillB;
      ctx.fillRect(px0, py, px1 - px0, py0 - py); ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5; ctx.strokeRect(px0, py, px1 - px0, py0 - py);
    }
    plot.fn(pdf, { color: c.ink, width: 3 });
  },
  controls: [
    { title: 'Narrow the bins' },
    { key: 'w', label: 'Bin width', options: [[16, '16 cm'], [8, '8 cm'], [4, '4 cm'], [2, '2 cm'], [1, '1 cm'], [0.5, '0.5 cm']] },
    { key: 'a', label: 'From', min: 140, max: 200, step: 1, format: (v) => `${v} cm` },
    { key: 'b', label: 'To', min: 141, max: 205, step: 1, format: (v) => `${v} cm` },
    { readout: [
      ['Sum of all bar areas', () => num(bars().reduce((s, r) => s + r[2], 0), 5)],
      ['P(from ≤ X ≤ to), the area under the curve', () => num(inRange(), 5)],
      ['Bars centred inside add up to', () => num(bars().filter(([x0, x1]) => (x0 + x1) / 2 >= state.a && (x0 + x1) / 2 <= state.b).reduce((s, r) => s + r[2], 0), 5)],
    ] },
  ],
  tex: () => 'P(a\\le X\\le b)=\\int_a^{b}f(x)\\,dx,\\qquad \\int_{-\\infty}^{\\infty}f=1',
});
