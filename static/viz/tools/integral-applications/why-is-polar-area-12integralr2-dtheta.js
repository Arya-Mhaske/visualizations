import { createTool } from '../../lib/tool.js';
import { simpson, num } from './_ia.js';
import { line } from '../../lib/draw.js';

// A thin sector of angle dθ and radius r has area ½ r² dθ (a slice of a disc), not a rectangle. Add n sectors.
const CURVES = {
  card: { name: 'Cardioid r = 1 + cos θ', r: (t) => 1 + Math.cos(t), a: 0, b: 2 * Math.PI, exact: (3 * Math.PI) / 2, R: 2 },
  rose: { name: 'Three-petal rose r = cos 3θ', r: (t) => Math.cos(3 * t), a: 0, b: Math.PI, exact: Math.PI / 4, R: 1 },
  spiral: { name: 'Spiral r = θ, one turn', r: (t) => t, a: 0, b: 2 * Math.PI, exact: (4 * Math.PI ** 3) / 3, R: 6.3 },
  circ: { name: 'Circle r = 2', r: () => 2, a: 0, b: 2 * Math.PI, exact: 4 * Math.PI, R: 2 },
};
const state = { fn: 'card', n: 6 };
const K = () => CURVES[state.fn];
const area = () => simpson((t) => 0.5 * K().r(t) ** 2, K().a, K().b, 2000);
const sum = (n) => { let s = 0; const h = (K().b - K().a) / n; for (let i = 0; i < n; i++) s += 0.5 * K().r(K().a + (i + 0.5) * h) ** 2 * h; return s; };

createTool({
  state,
  label: 'A polar curve with n thin pie-slice sectors drawn from the origin out to the curve. The sector areas add up to the area inside the curve.',
  draw(ctx, stage, c) {
    const k = K();
    const s = (Math.min(stage.w, stage.h) / 2 - 14) / k.R;
    const [cx, cy] = [stage.w / 2, stage.h / 2];
    const P = (t, r) => [cx + r * Math.cos(t) * s, cy - r * Math.sin(t) * s];
    const h = (k.b - k.a) / state.n;
    for (let i = 0; i < state.n; i++) {
      const t0 = k.a + i * h; const tm = t0 + h / 2; const rm = k.r(tm);
      ctx.fillStyle = i % 2 ? c.fillA : c.fillB;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      for (let j = 0; j <= 12; j++) { const t = t0 + (h * j) / 12; const [x, y] = P(t, Math.abs(rm)); ctx.lineTo(x, y); }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.strokeStyle = c.ink; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let j = 0; j <= 400; j++) { const t = k.a + ((k.b - k.a) * j) / 400; const [x, y] = P(t, k.r(t)); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    line(ctx, 0, cy, stage.w, cy, { color: c.grid, width: 1 });
    line(ctx, cx, 0, cx, stage.h, { color: c.grid, width: 1 });
  },
  controls: [
    { title: 'Fill with sectors' },
    { key: 'fn', label: 'Curve', options: Object.entries(CURVES).map(([k, v]) => [k, v.name]) },
    { key: 'n', label: 'Sectors n', min: 1, max: 60, step: 1 },
    { readout: [
      ['Sum of ½ r² Δθ', () => num(sum(state.n), 6)],
      ['Integral ½∫r² dθ', () => num(area(), 6)],
    ] },
  ],
  tex: () => 'A=\\tfrac12\\int_{\\alpha}^{\\beta}r(\\theta)^2\\,d\\theta',
});
