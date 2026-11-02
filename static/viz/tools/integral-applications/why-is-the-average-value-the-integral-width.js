import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// Think of the area under the curve as water in a tank with that profile. Let it settle: it becomes a level rectangle of the same area, as high as the average value.
const FN = {
  hump: { name: 'x(4 − x)', f: (x) => x * (4 - x), lo: 0, hi: 4, y: [0, 5] },
  sin: { name: '1 + sin x', f: (x) => 1 + Math.sin(x), lo: 0, hi: 2 * Math.PI, y: [0, 2.4] },
  ramp: { name: 'x²', f: (x) => x * x, lo: 0, hi: 3, y: [0, 10] },
};
const state = { fn: 'hump', end: 100, settle: 0 };
const K = () => FN[state.fn];
const b = () => K().lo + (state.end / 100) * (K().hi - K().lo);
const area = () => simpson(K().f, K().lo, b(), 400);
const avg = () => area() / (b() - K().lo);

createTool({
  state,
  label: 'A curve with the area under it as blue water. A slider lets the water settle into a flat rectangle of the same area; its height is the average value.',
  setup: (stage, c) => createPlot(stage, { x: [0, 4], y: [0, 5], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    plot.setRange([k.lo - 0.1, k.hi * 1.02], k.y);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const t = state.settle / 100;
    const level = (x) => (1 - t) * k.f(x) + t * avg();
    plot.shade(level, null, k.lo, b(), c.fillB);
    plot.fn(k.f, { color: c.ink, width: 3, domain: [k.lo, k.hi] });
    plot.segment(k.lo, avg(), b(), avg(), { color: c.a, width: 3 });
    plot.segment(b(), 0, b(), k.y[1], { color: c.ink, width: 1.5, dash: [4, 4] });
  },
  controls: [
    { title: 'Let the water settle' },
    { key: 'fn', label: 'Curve', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'end', label: 'Right end of the interval', min: 20, max: 100, step: 5, format: (v) => `${v}%` },
    { key: 'settle', label: 'Settle', min: 0, max: 100, step: 5, format: (v) => `${v}%` },
    { readout: [
      ['Area under the curve', () => num(area(), 5)],
      ['Width b − a', () => num(b() - K().lo, 4)],
      ['Level height = area ÷ width', () => num(avg(), 5)],
    ] },
  ],
  tex: () => 'f_{\\text{avg}}=\\frac{1}{b-a}\\int_a^{b}f(x)\\,dx',
});
