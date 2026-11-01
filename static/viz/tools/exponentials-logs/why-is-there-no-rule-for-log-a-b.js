import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { logb } from './_exp-log-math.js';

const state = { base: 10, a: 3, b: 5 };
const values = (s) => {
  const f = (x) => logb(s.base, x);
  return [f(s.a + s.b), f(s.a) + f(s.b), f(s.a) * f(s.b)];
};
const NAMES = ['log(a+b)', 'log a + log b', 'log a · log b'];
const same = (u, v) => Math.abs(u - v) < 1e-9;

createTool({
  state,
  label: 'Three bars. The first is the logarithm of a plus b. The second is the sum of the two separate logarithms, which is the tempting rule. The third is their product, another tempting rule. The bars almost never match the first one.',
  setup: (stage, c) => createPlot(stage, { x: [0, 3], y: [0, 4], c }),
  draw(ctx, stage, c, plot) {
    const v = values(state);
    const top = Math.max(...v, 0.5) * 1.25;
    plot.setRange([0, 3], [-top * 0.1, top]);
    plot.segment(0, 0, 3, 0, { color: c.ink, width: 3 });
    v.forEach((h, i) => {
      plot.shade(() => h, null, i + 0.15, i + 0.85, [c.fillA, c.fillB, c.fillC][i]);
      for (const [x1, y1, x2, y2] of [[i + 0.15, 0, i + 0.15, h], [i + 0.85, 0, i + 0.85, h], [i + 0.15, h, i + 0.85, h]]) plot.segment(x1, y1, x2, y2, { color: c.ink, width: 3 });
      plot.text(fixed(h, 3), i + 0.5, h + top * 0.06, { size: 11, patch: false });
      plot.text(NAMES[i], i + 0.5, -top * 0.05, { size: 9, patch: false });
    });
    plot.segment(0, v[0], 3, v[0], { color: c.a, width: 2, dash: [6, 4] });
  },
  controls: [
    { title: 'Test the tempting rules' },
    { key: 'base', label: 'Log base', options: [[2, '2'], [10, '10']] },
    { key: 'a', label: 'a', min: 1, max: 20, step: 1 },
    { key: 'b', label: 'b', min: 1, max: 20, step: 1 },
    { readout: [
      ['log(a+b)', (s) => fixed(values(s)[0], 4)],
      ['log a + log b', (s) => ({ text: fixed(values(s)[1], 4), good: same(values(s)[0], values(s)[1]) })],
      ['log a · log b', (s) => ({ text: fixed(values(s)[2], 4), good: same(values(s)[0], values(s)[2]) })],
      ['The sum equals', (s) => `log(${s.a * s.b}), not log(${s.a + s.b})`],
    ] },
  ],
  tex: (s) => `\\log(${s.a}+${s.b})=${fixed(values(s)[0], 4)}\\ \\neq\\ \\log ${s.a}+\\log ${s.b}=${fixed(values(s)[1], 4)}=\\log ${s.a * s.b}`,
});
