import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// Demand curve D(q): the q-th buyer would pay up to D(q). At market price P everyone with D(q) ≥ P buys, and the q-th buyer saves D(q) − P. Surplus = ∫₀^q* (D(q) − P) dq. Made-up numbers.
const CURVES = {
  lin: { name: 'D(q) = 100 − q', D: (q) => 100 - q, qmax: 100 },
  curve: { name: 'D(q) = 100 − q²/100', D: (q) => 100 - (q * q) / 100, qmax: 100 },
  decay: { name: 'D(q) = 100 e^(−q/40)', D: (q) => 100 * Math.exp(-q / 40), qmax: 160 },
};
const state = { kind: 'lin', P: 40, n: 10 };
const K = () => CURVES[state.kind];
const qStar = () => { let lo = 0; let hi = K().qmax; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (K().D(m) > state.P) lo = m; else hi = m; } return (lo + hi) / 2; };
const surplus = () => simpson((q) => K().D(q) - state.P, 0, qStar(), 800);
const steps = () => { const q = qStar(); const h = q / state.n; let s = 0; for (let i = 0; i < state.n; i++) s += (K().D((i + 0.5) * h) - state.P) * h; return s; };

createTool({
  state,
  label: 'A falling demand curve and a horizontal price line. Blocks show groups of buyers, each saving the gap between what it would pay and the price. As the groups get smaller the blocks fill the area between the curve and the price line.',
  setup: (stage, c) => createPlot(stage, { x: [0, 100], y: [0, 105], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, K().qmax], [0, 105]);
    plot.axes({ xLabel: 'quantity q (buyers)', yLabel: 'price (₹)' });
    const q = qStar(); const h = q / state.n;
    for (let i = 0; i < state.n; i++) {
      const m = K().D((i + 0.5) * h) - state.P;
      const [x1, y1] = plot.toPx(i * h, state.P + m); const [x2, y2] = plot.toPx((i + 1) * h, state.P);
      ctx.fillStyle = c.fillB; ctx.fillRect(x1, y1, x2 - x1, y2 - y1); ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    }
    plot.fn(K().D, { color: c.ink, width: 3, domain: [0, K().qmax] });
    plot.segment(0, state.P, K().qmax, state.P, { color: c.a, width: 3 });
    plot.point(q, state.P, { fill: c.c, r: 7 });
  },
  controls: [
    { title: 'Set the price' },
    { key: 'kind', label: 'Demand', options: Object.entries(CURVES).map(([k, v]) => [k, v.name]) },
    { key: 'P', label: 'Market price P', min: 5, max: 90, step: 5, format: (v) => `₹${v}` },
    { key: 'n', label: 'Blocks', min: 1, max: 40, step: 1 },
    { readout: [
      ['Buyers at this price q*', () => num(qStar(), 4)],
      ['Savings by blocks', () => `₹${num(steps(), 6)}`],
      ['Consumer surplus ∫(D − P) dq', () => `₹${num(surplus(), 6)}`],
    ] },
  ],
  tex: (s) => `\\text{surplus}=\\int_0^{q^*}\\big(D(q)-P\\big)\\,dq=${num(surplus(), 4)}`,
});
