import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from './_ig.js';

// Setting u equal to the whole root removes it: the new integrand is rational in u and the area is unchanged.
const CASES = {
  cube: { name: '∫ dx / (1 + ∛(x + 2))', f: (x) => 1 / (1 + Math.cbrt(x + 2)), g: (u) => (3 * u * u) / (1 + u), u: (x) => Math.cbrt(x + 2), x0: -1, x1: 25, tex: '\\int\\dfrac{dx}{1+\\sqrt[3]{x+2}}', sub: 'u=\\sqrt[3]{x+2},\\ x=u^3-2,\\ dx=3u^2du', rat: '\\int\\dfrac{3u^2}{1+u}\\,du' },
  sqrt: { name: '∫ dx / (1 + √x)', f: (x) => 1 / (1 + Math.sqrt(x)), g: (u) => (2 * u) / (1 + u), u: (x) => Math.sqrt(x), x0: 0, x1: 9, tex: '\\int\\dfrac{dx}{1+\\sqrt{x}}', sub: 'u=\\sqrt{x},\\ x=u^2,\\ dx=2u\\,du', rat: '\\int\\dfrac{2u}{1+u}\\,du' },
};
const state = { k: 'cube', p: 1 };
const bOf = (s) => CASES[s.k].x0 + s.p * (CASES[s.k].x1 - CASES[s.k].x0);

const tool = createTool({
  state,
  label: 'Two graphs side by side. On the left, the original integrand with its root, shaded from the start to b. On the right, the same area re-expressed in u, with no root, shaded over the matching u range. The shaded areas are equal.',
  setup: (stage, c) => ({
    left: createPlot(stage, { x: [-1, 25], y: [0, 1], c, pad: 22, box: (g) => ({ x: 0, y: 0, w: g.w / 2, h: g.h }) }),
    right: createPlot(stage, { x: [1, 3], y: [0, 4], c, pad: 22, box: (g) => ({ x: g.w / 2, y: 0, w: g.w / 2, h: g.h }) }),
  }),
  draw(ctx, stage, c, { left, right }) {
    const K = CASES[state.k];
    const b = bOf(state);
    left.setRange([K.x0 - 0.05 * (K.x1 - K.x0), K.x1], [0, K.f(K.x0) * 1.2 + 0.1]);
    left.axes({ xLabel: 'x', yLabel: 'f(x)' });
    left.shade(K.f, null, K.x0, b, c.fillB);
    left.fn(K.f, { color: c.a, domain: [K.x0, K.x1] });
    const u0 = K.u(K.x0);
    const u1 = K.u(K.x1);
    right.setRange([u0 - 0.05, u1 + 0.1], [0, Math.max(K.g(u0), K.g(u1)) * 1.2 + 0.1]);
    right.axes({ xLabel: 'u', yLabel: 'g(u)' });
    right.shade(K.g, null, u0, K.u(b), c.fillC);
    right.fn(K.g, { color: c.c, domain: [u0, u1] });
  },
  controls: () => [
    { title: 'Remove the root' },
    { key: 'k', label: 'Integral', options: Object.entries(CASES).map(([k, v]) => [k, v.name]) },
    { key: 'p', label: 'Upper limit b', min: 0.1, max: 1, step: 0.01, format: (v) => fixed(CASES[state.k].x0 + v * (CASES[state.k].x1 - CASES[state.k].x0), 2) },
    { readout: [
      ['u runs from … to', (s) => `${fixed(CASES[s.k].u(CASES[s.k].x0), 3)} → ${fixed(CASES[s.k].u(bOf(s)), 3)}`],
      ['Area, with the root', (s) => fixed(exact(CASES[s.k].f, CASES[s.k].x0, bOf(s)), 5)],
      ['Area, in u', (s) => fixed(exact(CASES[s.k].g, CASES[s.k].u(CASES[s.k].x0), CASES[s.k].u(bOf(s))), 5)],
    ] },
  ],
  tex: (s) => `${CASES[s.k].tex}\\ \\xrightarrow{${CASES[s.k].sub}}\\ ${CASES[s.k].rat}`,
});

tool.update();
