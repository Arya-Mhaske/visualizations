import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { expand } from './_quadratic-equations-math.js';

const state = { a: 1, r: 1, s: -3 };
const v = (n) => (n < 0 ? `(${fixed(n, 1)})` : fixed(n, 1));

createTool({
  state,
  label: 'A parabola built from its roots r and s as a times x minus r times x minus s. Expanding the brackets gives the coefficients: b is minus a times the sum of the roots, and c is a times the product of the roots. The readouts match them live, and the curve crosses the axis exactly at r and s.',
  setup: (stage, c) => createPlot(stage, { x: [-8, 8], y: [-16, 16], c }),
  draw(ctx, stage, c, plot) {
    const { a, b, c: cc } = expand(state.a, state.r, state.s);
    plot.axes();
    plot.fn((x) => a * x * x + b * x + cc, { color: c.a, width: 4 });
    [state.r, state.s].forEach((x, i) => plot.point(x, 0, { fill: i ? c.b : c.c, r: 8 }));
  },
  controls: [
    { title: 'Choose the roots' },
    { key: 'r', label: 'Root r', min: -6, max: 6, step: 0.5 },
    { key: 's', label: 'Root s', min: -6, max: 6, step: 0.5 },
    { key: 'a', label: 'a', min: 1, max: 3, step: 1 },
    { readout: [
      ['b ÷ a', (s) => fixed(expand(s.a, s.r, s.s).b / s.a, 2)],
      ['−(r + s)', (s) => fixed(-(s.r + s.s), 2)],
      ['c ÷ a', (s) => fixed(expand(s.a, s.r, s.s).c / s.a, 2)],
      ['r · s', (s) => fixed(s.r * s.s, 2)],
    ] },
  ],
  tex: (s) => {
    const e = expand(s.a, s.r, s.s);
    return `${s.a}(x-${v(s.r)})(x-${v(s.s)})=${s.a}x^2-${s.a}(${fixed(s.r + s.s, 1)})x+${s.a}(${fixed(s.r * s.s, 1)})\\ \\Rightarrow\\ b=${fixed(e.b, 1)},\\ c=${fixed(e.c, 1)}`;
  },
});
