import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const PAIRS = [
  { name: 'f = √x after g = x² − 4', f: (x) => (x < 0 ? NaN : Math.sqrt(x)), g: (x) => x * x - 4, rule: 'f needs its input ≥ 0, so g(x) ≥ 0: |x| ≥ 2' },
  { name: 'f = 1/x after g = x − 2', f: (x) => (x === 0 ? NaN : 1 / x), g: (x) => x - 2, rule: 'f cannot take 0, so g(x) ≠ 0: x ≠ 2' },
  { name: 'f = √x after g = 3 − x', f: (x) => (x < 0 ? NaN : Math.sqrt(x)), g: (x) => 3 - x, rule: 'g(x) ≥ 0: x ≤ 3' },
];
const state = { which: 0 };
const P = (s = state) => PAIRS[s.which];
const ok = (s, x) => Number.isFinite(P(s).f(P(s).g(x)));

createTool({
  state,
  label: 'The graph of g, drawn in coral where its output is something f can accept and in grey where it is not. The thick bar along the x-axis marks the x values that survive in the composite f of g: they are exactly the places where g\'s output lands in the domain of f. Everything else is removed, so the domain of the composite is smaller than the domain of g.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-6, 8], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    let prev = null;
    for (let i = 0; i <= 600; i++) {
      const x = -6 + (12 * i) / 600;
      const y = P().g(x);
      const good = ok(state, x);
      if (prev) {
        plot.segment(prev.x, prev.y, x, y, { color: good ? c.a : c.grid, width: good ? 4 : 2 });
        plot.segment(prev.x, 0, x, 0, { color: good ? c.c : c.paper, width: good ? 8 : 1 });
      }
      prev = { x, y };
    }
  },
  controls: [
    { title: 'Compose f after g' },
    { key: 'which', label: 'Pair', min: 0, max: PAIRS.length - 1, step: 1, format: (v) => PAIRS[v].name },
    { readout: [
      ['Domain of g', () => 'every real number'],
      ['Domain of f∘g', (s) => P(s).rule.split(': ')[1]],
      ['Why', (s) => P(s).rule.split(': ')[0]],
    ] },
  ],
  tex: (s) => `\\operatorname{dom}(f\\circ g)=\\{x\\in\\operatorname{dom}g:\\ g(x)\\in\\operatorname{dom}f\\}`,
});
