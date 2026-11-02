import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from './_ig.js';
import { EX, integrand } from './_subst.js';

// ∫ₓ₀ᵇ f(g(x)) g′(x) dx = ∫_{g(x₀)}^{g(b)} f(u) du: the x-interval maps to the u-interval, and the area is the same.
const state = { k: 'cosx2', p: 0.8 };
const bOf = (s) => EX[s.k].x0 + s.p * (EX[s.k].x1 - EX[s.k].x0);
const span = (f, lo, hi) => {
  let a = Infinity;
  let b = -Infinity;
  for (let i = 0; i <= 80; i++) { const y = f(lo + ((hi - lo) * i) / 80); a = Math.min(a, y); b = Math.max(b, y); }
  const pad = (b - a) * 0.15 + 0.1;
  return [Math.min(a, 0) - pad, Math.max(b, 0) + pad];
};

const tool = createTool({
  state,
  label: 'Two graphs side by side. On the left, the integrand in x with the area from the start to b shaded. On the right, the outer function f of u, shaded over the matching u interval from g of the start to g of b. The two shaded areas are equal.',
  setup: (stage, c) => ({
    left: createPlot(stage, { x: [0, 2], y: [-4, 4], c, pad: 22, box: (g) => ({ x: 0, y: 0, w: g.w / 2, h: g.h }) }),
    right: createPlot(stage, { x: [0, 4], y: [-4, 4], c, pad: 22, box: (g) => ({ x: g.w / 2, y: 0, w: g.w / 2, h: g.h }) }),
  }),
  draw(ctx, stage, c, { left, right }) {
    const e = EX[state.k];
    const b = bOf(state);
    const f = (x) => integrand(e, x);
    const [u0, u1] = [e.g(e.x0), e.g(b)];
    left.setRange([e.x0 - 0.05, e.x1 + 0.05], span(f, e.x0 + 0.01, e.x1));
    left.axes({ xLabel: 'x', yLabel: 'f(g)g′' });
    left.shade(f, null, e.x0, b, c.fillB);
    left.fn(f, { color: c.a, domain: [e.x0 + 1e-6, e.x1] });
    left.segment(b, -50, b, 50, { color: c.ink, width: 2, dash: [4, 4] });
    const lo = Math.min(u0, u1, e.g(e.x1));
    const hi = Math.max(u0, u1, e.g(e.x1));
    right.setRange([Math.min(lo, 0) - 0.1, hi + 0.2], span(e.f, lo, hi));
    right.axes({ xLabel: 'u', yLabel: 'f(u)' });
    right.shade(e.f, null, u0, u1, c.fillC);
    right.fn(e.f, { color: c.c });
    right.segment(u1, -50, u1, 50, { color: c.ink, width: 2, dash: [4, 4] });
  },
  controls: () => [
    { title: 'Move the upper limit' },
    { key: 'k', label: 'Integrand', options: Object.entries(EX).map(([k, v]) => [k, v.name]) },
    { key: 'p', label: 'Upper limit b', min: 0.1, max: 1, step: 0.01, format: (v) => fixed(EX[state.k].x0 + v * (EX[state.k].x1 - EX[state.k].x0), 2) },
    { readout: [
      ['x from … to', (s) => `${fixed(EX[s.k].x0, 2)} → ${fixed(bOf(s), 2)}`],
      ['u = g(x) from … to', (s) => `${fixed(EX[s.k].g(EX[s.k].x0), 3)} → ${fixed(EX[s.k].g(bOf(s)), 3)}`],
      ['Area in x', (s) => fixed(exact((x) => integrand(EX[s.k], x), EX[s.k].x0, bOf(s)), 5)],
      ['Area in u', (s) => fixed(exact(EX[s.k].f, EX[s.k].g(EX[s.k].x0), EX[s.k].g(bOf(s))), 5)],
    ] },
  ],
  tex: (s) => { const e = EX[s.k]; return `\\int_{${fixed(e.x0, 1)}}^{${fixed(bOf(s), 2)}}${e.tex}\\,dx=\\int_{${fixed(e.g(e.x0), 2)}}^{${fixed(e.g(bOf(s)), 2)}}${e.fTex}\\,du`; },
});

tool.update();
