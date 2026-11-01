import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { logb } from './_exp-log-math.js';

const state = { b: 2, c2: 10, x: 5, stretch: false };
const BASES = [[2, '2'], [3, '3'], [Math.E, 'e'], [10, '10']];
const name = (v) => (Math.abs(v - Math.E) < 1e-9 ? 'e' : `${v}`);
const k = (s) => Math.log(s.c2) / Math.log(s.b);

createTool({
  state,
  label: 'Graphs of the logarithm of x to two different bases. Whatever x you choose, the ratio of the two heights is the same number. Switching on the stretch draws the second curve stretched vertically by that number, and it lands exactly on the first curve.',
  setup: (stage, c) => createPlot(stage, { x: [0, 20], y: [-4, 5.5], c }),
  draw(ctx, stage, c, plot) {
    const { b, c2, x } = state;
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((t) => logb(b, t), { color: c.b, width: 5, domain: [0.02, 20] });
    plot.fn((t) => logb(c2, t), { color: c.a, width: 4, domain: [0.02, 20] });
    if (state.stretch) plot.fn((t) => k(state) * logb(c2, t), { color: c.ink, width: 2, dash: [5, 5], domain: [0.02, 20] });
    plot.segment(x, 0, x, logb(b, x), { color: c.grid, width: 2, dash: [4, 4] });
    plot.point(x, logb(b, x), { fill: c.b, r: 8 });
    plot.point(x, logb(c2, x), { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Compare two bases' },
    { key: 'b', label: 'Blue base', options: BASES },
    { key: 'c2', label: 'Coral base', options: BASES },
    { key: 'x', label: 'x', min: 1.5, max: 19, step: 0.5 },
    { key: 'stretch', label: 'Stretch the coral curve by the ratio', toggle: true },
    { readout: [
      ['Blue height', (s) => fixed(logb(s.b, s.x), 3)],
      ['Coral height', (s) => fixed(logb(s.c2, s.x), 3)],
      ['Blue ÷ coral', (s) => ({ text: fixed(logb(s.b, s.x) / logb(s.c2, s.x), 4), good: true })],
      ['ln c ÷ ln b', (s) => fixed(k(s), 4)],
    ] },
  ],
  tex: (s) => `\\log_{${name(s.b)}}x=\\dfrac{\\log_{${name(s.c2)}}x}{\\log_{${name(s.c2)}}${name(s.b)}}\\ :\\ ${fixed(logb(s.b, s.x), 3)}=\\dfrac{${fixed(logb(s.c2, s.x), 3)}}{${fixed(logb(s.c2, s.b), 3)}}`,
});
