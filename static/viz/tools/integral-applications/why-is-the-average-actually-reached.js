import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, roots, num } from './_ia.js';

// Mean value theorem for integrals: a continuous f must cross its own average level. A function with a jump may skip over it.
const FN = {
  hump: { name: 'x(4 − x) on [0, 4]  (continuous)', f: (x) => x * (4 - x), lo: 0, hi: 4, y: [0, 5] },
  wave: { name: '2 + sin 2x on [0, 3]  (continuous)', f: (x) => 2 + Math.sin(2 * x), lo: 0, hi: 3, y: [0, 3.5] },
  step: { name: 'Jump: 1 then 4 on [0, 4]  (not continuous)', f: (x) => (x < 3 ? 1 : 4), lo: 0, hi: 4, y: [0, 5] },
};
const state = { fn: 'hump' };
const K = () => FN[state.fn];
const avg = () => simpson(K().f, K().lo, K().hi, 4000) / (K().hi - K().lo);
const hits = () => (state.fn === 'step' ? [] : roots((x) => K().f(x) - avg(), K().lo, K().hi, 2000));

createTool({
  state,
  label: 'A curve with a horizontal line at its average value. Where the curve is continuous the line must cross it, at points marked in green. For a curve with a jump the line may pass through the gap.',
  setup: (stage, c) => createPlot(stage, { x: [0, 4], y: [0, 5], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    plot.setRange([k.lo - 0.1, k.hi + 0.1], k.y);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(k.f, null, k.lo, k.hi, c.fillB);
    plot.fn(k.f, { color: c.ink, width: 3, domain: [k.lo, k.hi] });
    plot.segment(k.lo, avg(), k.hi, avg(), { color: c.a, width: 3 });
    for (const x of hits()) plot.point(x, avg(), { fill: c.c, r: 8 });
  },
  controls: [
    { title: 'Check the crossing' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { readout: [
      ['Average value', () => num(avg(), 5)],
      ['Points c where f(c) = average', () => hits().map((x) => num(x, 4)).join(', ') || 'none: the level skips the jump'],
      ['Guaranteed?', () => (state.fn === 'step' ? { text: 'no: not continuous', good: false } : { text: 'yes: continuous', good: true })],
    ] },
  ],
  tex: () => 'f\\ \\text{continuous}\\ \\Rightarrow\\ \\exists c:\\ f(c)=\\frac{1}{b-a}\\int_a^{b}f',
});
