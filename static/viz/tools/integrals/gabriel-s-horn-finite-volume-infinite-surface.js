import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from '../integral-applications/_ia.js';

// Rotate y = 1/x (x ≥ 1) about the x-axis. V(b) = π(1 − 1/b) → π. S(b) = 2π∫ (1/x)√(1 + 1/x⁴) dx ≥ 2π ln b → ∞.
const state = { s: 1 };
const b = () => 10 ** state.s;
const V = (bb) => Math.PI * (1 - 1 / bb);
const S = (bb) => simpson((u) => 2 * Math.PI * Math.sqrt(1 + Math.exp(-4 * u)), 0, Math.log(bb), 400); // x = e^u: (1/x)√(1+1/x⁴) dx = √(1 + e^(−4u)) du

createTool({
  state,
  label: 'Top: the silhouette of Gabriel horn out to x equals b. Bottom: its volume (blue), which levels off at pi, and its surface area (coral), which grows without limit, against log of b.',
  setup: (stage, c) => createPlot(stage, { x: [0, 6], y: [0, 40], c, box: (s) => ({ x: 0, y: s.h * 0.45, w: s.w, h: s.h * 0.55 }) }),
  draw(ctx, stage, c, plot) {
    const H = stage.h * 0.45;
    const X = Math.min(b(), 14);
    const sx = (stage.w - 30) / 14;
    const cy = H / 2 + 6;
    const sy = (H / 2 - 10) / 1;
    const pts = [];
    for (let i = 0; i <= 100; i++) { const x = 1 + ((X - 1) * i) / 100; pts.push([15 + (x - 1) * sx, 1 / x]); }
    ctx.fillStyle = c.fillB; ctx.strokeStyle = c.ink; ctx.lineWidth = 3;
    ctx.beginPath();
    pts.forEach(([px, r], i) => (i ? ctx.lineTo(px, cy - r * sy) : ctx.moveTo(px, cy - r * sy)));
    for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], cy + pts[i][1] * sy);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    plot.setRange([0, 6], [0, 95]);
    plot.axes({ xLabel: 'log₁₀ b', yLabel: 'V, S' });
    plot.segment(0, Math.PI, 6, Math.PI, { color: c.b, width: 2, dash: [6, 4] });
    plot.fn((s) => V(10 ** s), { color: c.b, width: 3 });
    plot.fn((s) => S(10 ** s), { color: c.a, width: 3 });
    plot.point(state.s, V(b()), { fill: c.b }); plot.point(state.s, S(b()), { fill: c.a });
  },
  controls: [
    { title: 'Stretch the horn' },
    { key: 's', label: 'Length: b = 10^s', min: 0.1, max: 6, step: 0.1, format: (v) => `b = ${num(10 ** v, 6)}` },
    { readout: [
      ['Volume V(b)', () => num(V(b()), 6)],
      ['Limit of V', () => `π = ${num(Math.PI, 6)}`],
      ['Surface S(b)', () => num(S(b()), 5)],
      ['Compare 2π ln b', () => num(2 * Math.PI * Math.log(b()), 5)],
    ] },
  ],
  tex: () => 'V=\\pi\\int_1^{\\infty}\\frac{dx}{x^2}=\\pi,\\qquad S\\ge 2\\pi\\int_1^{\\infty}\\frac{dx}{x}=\\infty',
});
