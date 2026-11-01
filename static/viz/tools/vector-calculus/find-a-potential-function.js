import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { POTENTIALS } from './_vector-calculus-math.js';
import { WINDOW, drawContours, fieldArrows } from './_vector-calculus-view.js';

const state = { which: 'a', step: 1, px: 1, py: 1 };
const STEPS = {
  a: [
    'F = (2xy + 3,\\ x^2 - 2y)',
    'f = \\int (2xy + 3)\\,dx = x^2 y + 3x + g(y)',
    'f_y = x^2 + g\'(y) = x^2 - 2y \\Rightarrow g\'(y) = -2y',
    'g(y) = -y^2,\\quad f = x^2 y + 3x - y^2 + C',
  ],
  b: [
    'F = (3x^2 + y,\\ x - 4y^3)',
    'f = \\int (3x^2 + y)\\,dx = x^3 + xy + g(y)',
    'f_y = x + g\'(y) = x - 4y^3 \\Rightarrow g\'(y) = -4y^3',
    'g(y) = -y^4,\\quad f = x^3 + xy - y^4 + C',
  ],
  c: [
    'F = (2x + y,\\ x + 2y)',
    'f = \\int (2x + y)\\,dx = x^2 + xy + g(y)',
    'f_y = x + g\'(y) = x + 2y \\Rightarrow g\'(y) = 2y',
    'g(y) = y^2,\\quad f = x^2 + xy + y^2 + C',
  ],
};
const eps = 1e-5;
const gradAt = (s) => {
  const f = POTENTIALS[s.which].f;
  return [(f(s.px + eps, s.py) - f(s.px - eps, s.py)) / (2 * eps), (f(s.px, s.py + eps) - f(s.px, s.py - eps)) / (2 * eps)];
};

const tool = createTool({
  state,
  label: 'A force field with arrows, and from step 4 the contours of the potential that was found. Arrows cross the contours at right angles.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const P = POTENTIALS[state.which];
    plot.axes({ grid: false });
    if (Number(state.step) >= 4) drawContours(ctx, plot, P.f, [-40, -20, -10, -5, -2, -0.5, 0.5, 2, 5, 10, 20, 40], { color: c.c, width: 2 });
    fieldArrows(ctx, plot, (x, y) => P.F(x, y), c, { step: 1, color: c.b, soft: 12 });
    plot.point(state.px, state.py, { fill: c.a, r: 7 });
  },
  controls: [
    { title: 'Work it out in four steps' },
    { key: 'which', label: 'Field', options: [['a', 'F = (2xy + 3, x² − 2y)'], ['b', 'F = (3x² + y, x − 4y³)'], ['c', 'F = (2x + y, x + 2y)']] },
    { key: 'step', label: 'Step', options: [[1, '1 The field'], [2, '2 Integrate P in x'], [3, '3 Match Q'], [4, '4 Finish g, check']] },
    { key: 'px', label: 'Check at x', min: -3, max: 3, step: 1 },
    { key: 'py', label: 'Check at y', min: -3, max: 3, step: 1 },
    { readout: [
      ['F at the point', (s) => `(${POTENTIALS[s.which].F(s.px, s.py).map((v) => fixed(v, 2)).join(', ')})`],
      ['∇f at the point', (s) => (Number(s.step) >= 4 ? `(${gradAt(s).map((v) => fixed(v, 2)).join(', ')})` : 'not found yet')],
    ] },
  ],
  tex: (s) => STEPS[s.which][Number(s.step) - 1],
});
