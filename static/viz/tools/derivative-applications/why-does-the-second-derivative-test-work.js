import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { FUNS, roots, num } from './_da.js';

// Near a critical point c, f(x) ≈ f(c) + ½ f″(c)(x − c)². If f″(c) > 0 that parabola is a cup (minimum); if < 0 a cap (maximum); if 0, no verdict.
const FN = {
  quartic: FUNS.quartic,
  cubic: FUNS.cubic,
  wave: FUNS.wave,
  bump: FUNS.bump,
  x4: { name: 'x⁴', f: (x) => x ** 4, d: (x) => 4 * x ** 3, d2: (x) => 12 * x * x, x: [-2, 2], y: [-1, 8] },
  nx4: { name: '−x⁴', f: (x) => -(x ** 4), d: (x) => -4 * x ** 3, d2: (x) => -12 * x * x, x: [-2, 2], y: [-8, 1] },
  x3: { name: 'x³', f: (x) => x ** 3, d: (x) => 3 * x * x, d2: (x) => 6 * x, x: [-2, 2], y: [-6, 6] },
};
const state = { fn: 'quartic', which: 1, zoom: 100 };
const K = () => FN[state.fn];
const crits = () => (['x4', 'nx4', 'x3'].includes(state.fn) ? [0] : roots(K().d, K().x[0], K().x[1]));
const C = () => { const c = crits(); return c[Math.min(state.which - 1, c.length - 1)]; };
const half = () => ((K().x[1] - K().x[0]) / 2) * (state.zoom / 100);

createTool({
  state,
  label: 'A graph near one of its critical points, with the matching parabola from the second derivative drawn on top. A zoom slider narrows the window until the graph and the parabola merge.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 1], y: [-1, 1], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    const cc = C();
    const w = Math.max(0.15, half());
    const f0 = k.f(cc);
    const quad = (x) => f0 + 0.5 * k.d2(cc) * (x - cc) ** 2;
    const ys = [-1, 1].map((s) => f0 + s * Math.max(0.3, ...[-1, -0.5, 0, 0.5, 1].map((u) => Math.abs(k.f(cc + u * w) - f0))) * 1.3);
    plot.setRange([cc - w, cc + w], ys);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(quad, { color: c.b, width: 3, dash: [6, 4] });
    plot.fn(k.f, { color: c.ink, width: 3 });
    plot.point(cc, f0, { fill: c.a, r: 7 });
  },
  controls: [
    { title: 'Zoom in on a critical point' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'which', label: 'Which critical point', min: 1, max: 4, step: 1, format: (v) => `#${Math.min(v, crits().length)} of ${crits().length}` },
    { key: 'zoom', label: 'Window width', min: 5, max: 100, step: 5, format: (v) => `${v}%` },
    { readout: [
      ['Critical point c', () => num(C(), 4)],
      ['f″(c)', () => num(K().d2(C()), 4)],
      ['Verdict', () => (K().d2(C()) > 1e-6 ? { text: 'minimum: the graph is a cup here', good: true } : K().d2(C()) < -1e-6 ? { text: 'maximum: the graph is a cap here', good: true } : { text: 'f″ = 0: the test is silent', good: false })],
    ] },
  ],
  tex: (s) => `f(x)\\approx f(c)+\\tfrac12 f''(c)(x-c)^2,\\quad f''(c)=${num(K().d2(C()), 3)}`,
});
