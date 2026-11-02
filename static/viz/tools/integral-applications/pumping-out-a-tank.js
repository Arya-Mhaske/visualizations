import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// A full tank is pumped out over its top at height H. A slice at height y weighs ρ g A(y) dy and is lifted H − y. W = ∫ ρ g A(y)(H − y) dy.
const RHO = 1000; const G = 9.8;
const H = 4;
const TANKS = {
  cyl: { name: 'Cylinder, radius 1.5 m', r: () => 1.5 },
  cone: { name: 'Cone, point down, top radius 1.5 m', r: (y) => (1.5 * y) / H },
  sph: { name: 'Hemisphere bowl, radius 4 m (depth 4)', r: (y) => Math.sqrt(Math.max(0, 16 - (4 - y) ** 2)) },
};
const state = { kind: 'cyl', n: 6 };
const K = () => TANKS[state.kind];
const area = (y) => Math.PI * K().r(y) ** 2;
const integrand = (y) => RHO * G * area(y) * (H - y);
const exact = () => simpson(integrand, 0, H, 800);
const sumN = () => { const h = H / state.n; let s = 0; for (let i = 0; i < state.n; i++) s += integrand((i + 0.5) * h) * h; return s; };

createTool({
  state,
  label: 'Top: a side view of a tank cut into horizontal slices, each lifted to the top. Bottom: the work for each slice against its height, whose total area is the work.',
  setup: (stage, c) => createPlot(stage, { x: [0, 4], y: [0, 1], c, box: (s) => ({ x: 0, y: s.h * 0.5, w: s.w, h: s.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const h0 = stage.h * 0.5;
    const sc = Math.min((h0 - 20) / H, (stage.w * 0.4) / 4);
    const cx = stage.w / 2; const bottom = h0 - 8;
    const hh = H / state.n;
    for (let i = 0; i < state.n; i++) {
      const y = (i + 0.5) * hh; const r = K().r(y) * sc;
      ctx.fillStyle = i % 2 ? c.fillA : c.fillB; ctx.fillRect(cx - r, bottom - (i + 1) * hh * sc, 2 * r, hh * sc);
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5; ctx.strokeRect(cx - r, bottom - (i + 1) * hh * sc, 2 * r, hh * sc);
    }
    ctx.strokeStyle = c.ink; ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const y = (H * i) / 60; const r = K().r(y) * sc; i ? ctx.lineTo(cx - r, bottom - y * sc) : ctx.moveTo(cx - r, bottom - y * sc); }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const y = (H * i) / 60; const r = K().r(y) * sc; i ? ctx.lineTo(cx + r, bottom - y * sc) : ctx.moveTo(cx + r, bottom - y * sc); }
    ctx.stroke();
    ctx.strokeStyle = c.a; ctx.beginPath(); ctx.moveTo(cx - 60, bottom - H * sc); ctx.lineTo(cx + 60, bottom - H * sc); ctx.stroke();
    plot.setRange([0, H], [0, Math.max(...Array.from({ length: 40 }, (_, i) => integrand((H * i) / 39))) * 1.15 || 1]);
    plot.axes({ xLabel: 'height y (m)', yLabel: 'work per metre (J/m)' });
    plot.shade(integrand, null, 0, H, c.fillA);
    plot.fn(integrand, { color: c.ink, width: 3 });
  },
  controls: [
    { title: 'Slice the water' },
    { key: 'kind', label: 'Tank', options: Object.entries(TANKS).map(([k, v]) => [k, v.name]) },
    { key: 'n', label: 'Number of slices', min: 1, max: 40, step: 1 },
    { readout: [
      ['Work by slices', () => `${num(sumN() / 1000, 5)} kJ`],
      ['Work exactly (integral)', () => `${num(exact() / 1000, 6)} kJ`],
      ['Whole load lifted H/2 (cylinder)', () => (state.kind === 'cyl' ? `${num((RHO * G * area(2) * H * (H / 2)) / 1000, 5)} kJ` : '—')],
    ] },
  ],
  tex: () => 'W=\\int_0^{H}\\rho g\\,A(y)\\,(H-y)\\,dy',
});
