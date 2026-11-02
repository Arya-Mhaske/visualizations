import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { FUNS, xAt, boxes, tangent, roots, num } from './_da.js';
import { dot } from '../../lib/draw.js';

// Concave up: the slope f′ increases, so f″ > 0 and the graph lies above its tangents. An inflection is where f″ changes sign.
const state = { fn: 'cubic', p: 25 };
const K = () => FUNS[state.fn];
const X = () => xAt(K(), state.p);
const infl = () => roots(K().d2, K().x[0], K().x[1]);
const [b1, b2, b3] = boxes(3);

createTool({
  state,
  label: 'Three graphs: f with a tangent, f prime, and f double prime. Where f double prime is positive the slope graph climbs and f bends up like a cup; where negative it bends down like a cap. Diamonds mark inflection points.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: b1 }), b: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: b2 }), d: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: b3 }) }),
  draw(ctx, stage, c, { a, b, d }) {
    const k = K();
    const x = X();
    const rng = (g) => { const m = Math.max(1, ...Array.from({ length: 60 }, (_, i) => Math.abs(g(k.x[0] + ((k.x[1] - k.x[0]) * i) / 59)))); return [-m * 1.15, m * 1.15]; };
    a.setRange(k.x, k.y); b.setRange(k.x, rng(k.d)); d.setRange(k.x, rng(k.d2));
    a.axes({ xLabel: 'x', yLabel: 'f' }); b.axes({ xLabel: 'x', yLabel: "f′" }); d.axes({ xLabel: 'x', yLabel: "f″" });
    // shade f″ sign on all three
    for (const p of [a, b, d]) {
      const [lo, hi] = p === a ? k.y : p === b ? rng(k.d) : rng(k.d2);
      const pts = [k.x[0], ...infl(), k.x[1]];
      for (let i = 0; i < pts.length - 1; i++) p.shade(() => hi, () => lo, pts[i], pts[i + 1], k.d2((pts[i] + pts[i + 1]) / 2) > 0 ? c.fillA : c.fillB);
    }
    a.fn(k.f, { color: c.ink, width: 3 });
    tangent(a, x, k.f(x), k.d(x), (k.x[1] - k.x[0]) * 0.12, c.a, 3);
    b.fn(k.d, { color: c.b, width: 3 });
    tangent(b, x, k.d(x), k.d2(x), (k.x[1] - k.x[0]) * 0.12, c.a, 3);
    d.fn(k.d2, { color: c.d, width: 3 });
    a.point(x, k.f(x), { fill: c.a }); b.point(x, k.d(x), { fill: c.a }); d.point(x, k.d2(x), { fill: c.a });
    for (const r of infl()) { dot(ctx, ...a.toPx(r, k.f(r)), 7, c.c, c.ink); }
  },
  controls: [
    { title: 'Move along f' },
    { key: 'fn', label: 'Function', options: [['cubic', 'x³/3 − x'], ['quartic', 'x⁴/4 − 2x² + 1'], ['wave', 'sin x + 0.4x'], ['bump', 'x e^(−x²/2)']] },
    { key: 'p', label: 'Position', min: 0, max: 100, step: 1, format: (v) => `x = ${xAt(K(), v).toFixed(2).replace('-', '−')}` },
    { readout: [
      ['Slope f′', () => num(K().d(X()), 4)],
      ["Slope's own slope f″", () => num(K().d2(X()), 4)],
      ['The bend', () => (K().d2(X()) > 1e-6 ? { text: 'concave up: a cup (blue)', good: true } : K().d2(X()) < -1e-6 ? { text: 'concave down: a cap (coral)', good: false } : 'straight: inflection?')],
      ['Inflection points', () => infl().map((r) => r.toFixed(2)).join(', ') || 'none'],
    ] },
  ],
  tex: () => "f''=\\frac{d}{dx}(f')>0\\ \\Rightarrow\\ f'\\text{ increases}\\ \\Rightarrow\\ \\text{cup}",
});
