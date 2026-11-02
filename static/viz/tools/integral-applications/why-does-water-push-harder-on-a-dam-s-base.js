import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from './_ia.js';

// Pressure grows with depth: p = ρ g d. A dam of width w: a strip at depth d has force ρ g d · w dd. Total F = ½ ρ g w H². Strips are not equal: the deep ones carry more.
const RHO = 1000; const G = 9.8;
const state = { H: 20, w: 100, n: 5 };
const p = (d) => RHO * G * d;
const strips = () => { const h = state.H / state.n; return Array.from({ length: state.n }, (_, i) => p((i + 0.5) * h) * state.w * h); };
const total = () => 0.5 * RHO * G * state.w * state.H ** 2;

createTool({
  state,
  label: 'Left: the face of a dam cut into strips, each shaded by how hard the water pushes on it. Right: pressure against depth, a straight line whose area is the force per unit width.',
  setup: (stage, c) => createPlot(stage, { x: [0, 200], y: [0, 20], c, box: (s) => ({ x: s.w * 0.45, y: 0, w: s.w * 0.55, h: s.h }) }),
  draw(ctx, stage, c, plot) {
    const left = stage.w * 0.42; const sc = (stage.h - 30) / 20;
    const top = 12; const hh = (state.H / state.n) * sc; const maxF = Math.max(...strips());
    strips().forEach((F, i) => {
      const w = 18 + (F / maxF) * (left - 40);
      ctx.fillStyle = c.fillB; ctx.fillRect(10, top + i * hh, left - 20, hh);
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5; ctx.strokeRect(10, top + i * hh, left - 20, hh);
      ctx.fillStyle = c.fillA; ctx.fillRect(10, top + i * hh + 2, w - 10, hh - 4);
    });
    plot.setRange([0, 220], [0, state.H * 1.05]);
    plot.axes({ xLabel: 'pressure (kPa)', yLabel: 'height above base (m)' });
    const [sx, sy] = plot.toPx(0, state.H); const [bx, by] = plot.toPx(0, 0); const [px, py] = plot.toPx(p(state.H) / 1000, 0);
    ctx.fillStyle = c.fillA; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(bx, by); ctx.lineTo(px, py); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(px, py); ctx.stroke();
  },
  controls: [
    { title: 'Build the dam' },
    { key: 'H', label: 'Water depth H', min: 5, max: 20, step: 1, format: (v) => `${v} m` },
    { key: 'w', label: 'Dam width', min: 20, max: 200, step: 10, format: (v) => `${v} m` },
    { key: 'n', label: 'Strips', min: 1, max: 20, step: 1 },
    { readout: [
      ['Pressure at the base', () => `${num(p(state.H) / 1000, 4)} kPa`],
      ['Force on the top strip', () => `${num(strips()[0] / 1e6, 4)} MN`],
      ['Force on the bottom strip', () => `${num(strips()[state.n - 1] / 1e6, 4)} MN`],
      ['Total from strips', () => `${num(strips().reduce((a, b) => a + b, 0) / 1e6, 5)} MN`],
      ['Exact ½ρ g w H²', () => `${num(total() / 1e6, 5)} MN`],
    ] },
  ],
  tex: (s) => `F=\\int_0^{H}\\rho g\\,d\\;w\\,dd=\\tfrac12\\rho g\\,w\\,H^2`,
});
