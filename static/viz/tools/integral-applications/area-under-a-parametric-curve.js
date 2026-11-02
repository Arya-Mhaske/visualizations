import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';
import { boxes } from './_ia.js';

// A = ∫ y dx = ∫ y(t) x′(t) dt. If the curve runs right to left, x′ < 0 and the area comes out negative.
const CURVES = {
  cyc: { name: 'Cycloid arch', x: (t) => t - Math.sin(t), y: (t) => 1 - Math.cos(t), xp: (t) => 1 - Math.cos(t), T: 2 * Math.PI, exact: 3 * Math.PI, xr: [-0.3, 6.6], yr: [-0.2, 2.4] },
  ell: { name: 'Upper half of an ellipse (a = 3, b = 2)', x: (t) => 3 * Math.cos(t), y: (t) => 2 * Math.sin(t), xp: (t) => -3 * Math.sin(t), T: Math.PI, exact: -3 * Math.PI, xr: [-3.6, 3.6], yr: [-0.4, 2.6] },
  par: { name: 'Parabola x = t, y = t² (0 to 2)', x: (t) => t, y: (t) => t * t, xp: () => 1, T: 2, exact: 8 / 3, xr: [-0.2, 2.4], yr: [-0.3, 4.4] },
};
const state = { fn: 'cyc', rev: false, t: 100 };
const K = () => CURVES[state.fn];
// Reversing the direction: t → T − t.
const pt = (u) => { const t = state.rev ? K().T - u : u; return [K().x(t), K().y(t)]; };
const speed = (u) => (state.rev ? -1 : 1) * K().xp(state.rev ? K().T - u : u);
const integrand = (u) => pt(u)[1] * speed(u);
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: a curve traced in a chosen direction, with the area between it and the x-axis shaded. Bottom: the integrand y times dx/dt against the parameter; it goes negative wherever the curve moves right to left.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [0, 7], y: [0, 3], c, box: bA }), b: createPlot(stage, { x: [0, 7], y: [-3, 3], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    const k = K(); const U = k.T * (state.t / 100);
    a.setRange(k.xr, k.yr);
    b.setRange([0, k.T], [-Math.max(1, ...Array.from({ length: 50 }, (_, i) => Math.abs(integrand((k.T * i) / 49)))) * 1.1, Math.max(1, ...Array.from({ length: 50 }, (_, i) => Math.abs(integrand((k.T * i) / 49)))) * 1.1]);
    a.axes({ xLabel: 'x', yLabel: 'y' });
    for (let i = 0; i < 200; i++) {
      const u0 = (U * i) / 200; const u1 = (U * (i + 1)) / 200;
      const [x0, y0] = pt(u0); const [x1, y1] = pt(u1);
      const [px0, pa] = a.toPx(x0, y0); const [px1, pb] = a.toPx(x1, y1); const base = a.toPx(0, 0)[1];
      ctx.fillStyle = x1 >= x0 ? c.fillC : c.fillA;
      ctx.beginPath(); ctx.moveTo(px0, base); ctx.lineTo(px0, pa); ctx.lineTo(px1, pb); ctx.lineTo(px1, base); ctx.closePath(); ctx.fill();
    }
    a.fn(() => 0, { color: c.grid, width: 1 });
    const pts = Array.from({ length: 200 }, (_, i) => pt((k.T * i) / 199));
    pts.forEach(([x, y], i) => { if (i) a.segment(pts[i - 1][0], pts[i - 1][1], x, y, { color: c.ink, width: 3 }); });
    a.point(...pt(U), { fill: c.a });
    b.axes({ xLabel: 'parameter', yLabel: 'y · dx/dt' });
    b.shade((u) => Math.max(0, integrand(u)), null, 0, U, c.fillC);
    b.shade((u) => Math.min(0, integrand(u)), null, 0, U, c.fillA);
    b.fn(integrand, { color: c.b, width: 3 });
  },
  controls: [
    { title: 'Trace the curve' },
    { key: 'fn', label: 'Curve', options: Object.entries(CURVES).map(([k, v]) => [k, v.name]) },
    { key: 'rev', label: 'Run it backwards (right to left)', toggle: true },
    { key: 't', label: 'How far along', min: 5, max: 100, step: 5, format: (v) => `${v}%` },
    { readout: [
      ['∫ y dx so far', () => num(simpson(integrand, 0, K().T * (state.t / 100) + 1e-9, 800), 5)],
      ['Whole curve', () => num(simpson(integrand, 0, K().T, 2000), 6)],
      ['Known value (π-based)', () => num((state.rev ? -1 : 1) * K().exact, 6)],
    ] },
  ],
  tex: () => 'A=\\int y\\,dx=\\int_{t_0}^{t_1}y(t)\\,x\'(t)\\,dt',
});
