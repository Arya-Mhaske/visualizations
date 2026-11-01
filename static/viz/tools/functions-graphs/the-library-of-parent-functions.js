import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { LIBRARY, parityOf } from './_properties-library-math.js';

const state = { fn: 'sq' };
const L = (s = state) => LIBRARY[s.fn];
const NAMES = { even: 'even (mirror)', odd: 'odd (half-turn)', neither: 'neither', both: 'both' };

createTool({
  state,
  label: 'The graph of one parent function chosen from eight: x, x squared, x cubed, square root, cube root, one over x, absolute value and greatest integer. The readout lists its domain, range, symmetry and behaviour.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-4, 4], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-4, 4], L().y);
    plot.axes({ grid: true });
    if (state.fn === 'floor') {
      for (let n = -4; n < 4; n++) {
        plot.segment(n, n, n + 1, n, { color: c.b, width: 4 });
        plot.point(n, n, { fill: c.ink, r: 5 });
        plot.point(n + 1, n, { fill: c.paper, r: 5 });
      }
    } else {
      plot.fn(L().f, { color: c.b, width: 4 });
      if (state.fn === 'root') plot.point(0, 0, { fill: c.ink, r: 5 });
    }
  },
  controls: [
    { title: 'Pick a parent function' },
    { key: 'fn', label: 'Function', options: Object.entries(LIBRARY).map(([k, v]) => [k, v.text]) },
    { readout: [
      ['Domain', (s) => L(s).domain],
      ['Range', (s) => L(s).range],
      ['Symmetry', (s) => NAMES[parityOf(L(s).f)]],
      ['Behaviour', (s) => L(s).trend],
    ] },
  ],
  tex: (s) => `y=${s.fn === 'floor' ? '\\lfloor x\\rfloor' : s.fn === 'root' ? '\\sqrt{x}' : s.fn === 'cbrt' ? '\\sqrt[3]{x}' : s.fn === 'recip' ? '\\dfrac{1}{x}' : s.fn === 'abs' ? '|x|' : s.fn === 'sq' ? 'x^2' : s.fn === 'cube' ? 'x^3' : 'x'}`,
});
