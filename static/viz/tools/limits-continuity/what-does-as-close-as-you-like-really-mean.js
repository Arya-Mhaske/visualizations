import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from '../integral-applications/_ia.js';
import { bestDelta } from './_eps.js';

// You choose ε (a band around L). The tool finds the biggest δ-window around a whose graph stays in the band.
const FN = {
  line: { name: 'f(x) = 2x + 1 as x → 1', f: (x) => 2 * x + 1, a: 1, L: 3 },
  sq: { name: 'f(x) = x² as x → 2', f: (x) => x * x, a: 2, L: 4 },
  sinc: { name: 'f(x) = sin x / x as x → 0', f: (x) => (x === 0 ? NaN : Math.sin(x) / x), a: 0, L: 1 },
  jump: { name: 'A jump: −1 left of 0, +1 right of 0', f: (x) => (x < 0 ? -1 : 1), a: 0, L: 0 },
};
const state = { fn: 'line', s: 1, L: 0 };
const K = () => FN[state.fn];
const eps = () => 10 ** -(state.s / 1);
const Lval = () => (state.fn === 'jump' ? state.L : K().L);
const delta = () => bestDelta(K().f, K().a, Lval(), eps());

createTool({
  state,
  label: 'A graph near a point. A horizontal band of half-width epsilon around the limit, and a vertical window of half-width delta around the point. The graph inside the window stays inside the band.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 1], y: [-1, 1], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    const d = delta();
    const e = eps();
    const W = state.fn === 'jump' ? 1 : Math.max(d * 2.4, 1e-4);
    const H = state.fn === 'jump' ? 1.6 : e * 2;
    plot.setRange([k.a - W, k.a + W], [Lval() - H, Lval() + H]);
    plot.axes({ xLabel: 'x', yLabel: 'f' });
    plot.shade(() => Lval() + e, () => Lval() - e, k.a - W, k.a + W, c.fillB);
    if (d > 0) plot.shade(() => Lval() + H, () => Lval() - H, k.a - d, k.a + d, c.fillC);
    plot.fn(k.f, { color: c.ink, width: 3, domain: [k.a - W, k.a + W] });
    plot.segment(k.a - d, Lval() - H, k.a - d, Lval() + H, { color: c.c, width: 2 });
    plot.segment(k.a + d, Lval() - H, k.a + d, Lval() + H, { color: c.c, width: 2 });
  },
  controls: [
    { title: 'Play the game' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 's', label: 'Band half-width ε', min: -0.3, max: 3, step: 0.1, format: (v) => num(10 ** -v, 3) },
    { key: 'L', label: 'Claimed limit L (jump only)', min: -1, max: 1, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['ε', () => num(eps(), 4)],
      ['Largest δ that works', () => (delta() > 0 ? { text: num(delta(), 4), good: true } : { text: 'none: no δ works', good: false })],
      ['Verdict', () => (delta() > 0 ? 'a window exists for this ε' : 'the limit L fails at this ε')],
    ] },
  ],
  tex: (s) => `|x-a|<\\delta\\ \\Rightarrow\\ |f(x)-L|<\\varepsilon\\quad(\\varepsilon=${num(eps(), 3)},\\ \\delta=${num(delta(), 3)})`,
});
