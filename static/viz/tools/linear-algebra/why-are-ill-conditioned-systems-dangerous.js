import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { svd2 } from './_la-math.js';

// x + y = 2 and x + (1 + ε) y = 2 + ε + δ. The solution is (1 − δ/ε, 1 + δ/ε): a nudge δ in b is multiplied by 1/ε.
const state = { e: 2, m: 2 };
const eps = (s) => 10 ** -s.e;
const delta = (s) => 10 ** -s.m;
const sol = (s) => [1 - delta(s) / eps(s), 1 + delta(s) / eps(s)];
const kappa = (s) => { const v = svd2([[1, 1], [1, 1 + eps(s)]]).s; return Math.abs(v[0] / v[1]); };

createTool({
  state,
  label: 'Two nearly parallel lines. The two equations x plus y equals 2 and x plus one plus epsilon times y equals 2 plus epsilon almost say the same thing, so the lines cross at a shallow angle. A tiny nudge to the right side of the second equation slides the second line a hair, but the crossing point runs far along the first line. The smaller epsilon, the bigger the jump.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 4], y: [-2, 4], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const e = eps(state);
    const d = delta(state);
    plot.axes();
    plot.fn((x) => 2 - x, { color: c.a, width: 4, domain: [-2, 4] });
    plot.fn((x) => (2 + e - x) / (1 + e), { color: c.grid, width: 3, dash: [6, 5], domain: [-2, 4] });
    plot.fn((x) => (2 + e + d - x) / (1 + e), { color: c.b, width: 4, domain: [-2, 4] });
    plot.point(1, 1, { fill: c.fillA, r: 6 });
    const s = sol(state);
    if (Math.abs(s[0]) < 6 && Math.abs(s[1]) < 6) plot.point(s[0], s[1], { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Nudge the right side' },
    { key: 'e', label: 'How nearly parallel: ε = 10⁻ᵏ, k', min: 1, max: 8, step: 1, format: (n) => `${n}` },
    { key: 'm', label: 'Size of the nudge: δ = 10⁻ᵐ, m', min: 1, max: 8, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Solution before nudging', () => '(1, 1)'],
      ['Solution after nudging', (s) => `(${sig(sol(s)[0], 5)}, ${sig(sol(s)[1], 5)})`],
      ['Relative nudge in b', (s) => sig(delta(s) / Math.hypot(2, 2 + eps(s)), 2)],
      ['Relative jump in x', (s) => sig(Math.abs(delta(s) / eps(s)), 2)],
      ['Condition number', (s) => ({ text: sig(kappa(s), 3), good: kappa(s) < 100 })],
    ] },
  ],
  tex: (s) => `\\dfrac{\\|\\Delta\\mathbf x\\|}{\\|\\mathbf x\\|}\\le\\kappa\\,\\dfrac{\\|\\Delta\\mathbf b\\|}{\\|\\mathbf b\\|},\\qquad \\kappa=\\dfrac{\\sigma_{\\max}}{\\sigma_{\\min}}\\approx${sig(kappa(s), 3)}`,
});
