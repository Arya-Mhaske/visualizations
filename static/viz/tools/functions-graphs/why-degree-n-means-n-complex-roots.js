import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { allRoots, showP } from './_polynomial-math.js';
import { fixed } from '../../lib/format.js';

const POLYS = [[1, -2, 5, -8, 4], [1, 0, 0, -1], [1, 0, 0, 0, 0, -1], [1, -1, 1, -1, 1]];
const state = { which: 0, peeled: 0 };
const P = (s = state) => POLYS[s.which];
const roots = (s = state) => allRoots(P(s));
const show = (z) => `${fixed(z[0], 2)}${z[1] ? `${z[1] < 0 ? ' − ' : ' + '}${fixed(Math.abs(z[1]), 2)}i` : ''}`;

createTool({
  state,
  label: 'The complex plane with the roots of a polynomial. Each press of the slider peels off one factor x minus r, where r is a root, leaving a polynomial of degree one less. The remaining roots are drawn solid and the removed ones hollow. The process continues until a constant is left, so a polynomial of degree n splits into n linear factors: n roots in the complex numbers, counting repeats.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 3], y: [-3, 3], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'real', yLabel: 'imag' });
    roots().forEach(([x, y], i) => {
      const gone = i < state.peeled;
      plot.point(x, y, { fill: gone ? c.paper : c.c, r: gone ? 7 : 9 });
    });
  },
  controls: [
    { title: 'Peel off the factors' },
    { key: 'which', label: 'Polynomial', min: 0, max: POLYS.length - 1, step: 1, format: (v) => showP(POLYS[v]) },
    { key: 'peeled', label: 'Factors removed', min: 0, max: 5, step: 1 },
    { readout: [
      ['Degree left', (s) => `${P(s).length - 1 - Math.min(s.peeled, P(s).length - 1)}`],
      ['Roots removed', (s) => roots(s).slice(0, s.peeled).map(show).join(';  ') || 'none yet'],
      ['Total roots', (s) => ({ text: `${roots(s).length} = degree`, good: roots(s).length === P(s).length - 1 })],
    ] },
  ],
  onChange(s) { s.peeled = Math.min(s.peeled, P(s).length - 1); },
  tex: (s) => `P(x)=${showP(P(s))}=${roots(s).map((z, i) => (i < s.peeled ? `(x-(${show(z)}))` : '')).join('')}\\cdot Q_{${P(s).length - 1 - Math.min(s.peeled, P(s).length - 1)}}(x)`,
});
