import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { evalP, fromRoots, mulP, turningPoints } from './_polynomial-math.js';

const state = { n: 4, r: 4 };
const pairs = (s = state) => (s.n - s.r) / 2;
const realRoots = (s = state) => Array.from({ length: s.r }, (_, i) => (s.r === 1 ? 0 : -3 + (6 * i) / (s.r - 1)));
const P = (s = state) => {
  let p = fromRoots(realRoots(s), 0.3);
  for (let i = 0; i < pairs(s); i++) p = mulP(p, [1, 0, 1 + i * 0.5]); // x² + c has no real roots
  return p;
};
const norm = (s) => { if (s.r > s.n) s.r = s.n; if ((s.n - s.r) % 2) s.r = Math.max(0, s.r - 1); };

createTool({
  state,
  label: 'A polynomial built from its factors. Each real root gives a linear factor, and each pair of complex roots gives a quadratic factor with no real roots. A degree n polynomial has n factors in all, counting each pair as two, so it has at most n real roots. The graph can turn only where its slope changes sign, and the slope is a polynomial of degree n minus 1, so there are at most n minus 1 turning points. The counts are shown.',
  setup: (stage, c) => createPlot(stage, { x: [-4.5, 4.5], y: [-6, 6], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const f = (x) => evalP(P(), x);
    const top = Math.max(2, ...Array.from({ length: 41 }, (_, i) => Math.abs(f(-4.5 + i * 0.225)))) * 0.6;
    plot.setRange([-4.5, 4.5], [-top, top]);
    plot.axes();
    plot.fn(f, { color: c.a, width: 4 });
    realRoots().forEach((r) => plot.point(r, 0, { fill: c.c, r: 7 }));
  },
  controls: [
    { title: 'Build a polynomial' },
    { key: 'n', label: 'Degree, n', min: 1, max: 7, step: 1 },
    { key: 'r', label: 'Real roots wanted', min: 0, max: 7, step: 1 },
    { readout: [
      ['Real roots', (s) => ({ text: `${s.r}  (at most ${s.n})`, good: s.r <= s.n })],
      ['Complex pairs', (s) => `${pairs(s)}`],
      ['Turning points', (s) => ({ text: `${turningPoints(P(s), -4.5, 4.5)}  (at most ${s.n - 1})`, good: true })],
    ] },
  ],
  onChange: norm,
  tex: (s) => `\\deg P=${s.n}:\\ \\text{roots}\\le ${s.n},\\ \\text{turns}\\le ${s.n - 1}`,
});
