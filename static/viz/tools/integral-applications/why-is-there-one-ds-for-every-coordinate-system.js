import { createTool } from '../../lib/tool.js';
import { line, dot } from '../../lib/draw.js';
import { num } from './_ia.js';

// One tiny hypotenuse ds, written three ways. Take a small step along the curve and compute it from dx and dy (y = f(x)), from dt (parametric) and from dr and r dθ (polar).
const CURVES = {
  card: { name: 'Cardioid r = 1 + cos θ', r: (t) => 1 + Math.cos(t), R: 2 },
  spiral: { name: 'Spiral r = θ/2', r: (t) => t / 2, R: 3.4 },
  circ: { name: 'Circle r = 2', r: () => 2, R: 2 },
};
const state = { fn: 'card', t: 1.2, h: 0.4 };
const K = () => CURVES[state.fn];
const pt = (t) => [K().r(t) * Math.cos(t), K().r(t) * Math.sin(t)];
const d = (f, t) => (f(t + 1e-6) - f(t - 1e-6)) / 2e-6;
const X = (t) => pt(t)[0]; const Y = (t) => pt(t)[1];
const step = () => { const [x0, y0] = pt(state.t); const [x1, y1] = pt(state.t + state.h); return { dx: x1 - x0, dy: y1 - y0, true: Math.hypot(x1 - x0, y1 - y0) }; };
const forms = () => {
  const dx = d(X, state.t) * state.h; // the step in x along the tangent
  const dsXY = Math.abs(dx) * Math.sqrt(1 + (d(Y, state.t) / d(X, state.t)) ** 2);
  const dsParam = Math.sqrt(d(X, state.t) ** 2 + d(Y, state.t) ** 2) * state.h;
  const dsPolar = Math.sqrt(K().r(state.t) ** 2 + d(K().r, state.t) ** 2) * state.h;
  return { dsXY, dsParam, dsPolar };
};

createTool({
  state,
  label: 'A polar curve with a short step along it and the right-angled triangle on that step. Three formulas for the step length, written for y of x, for a parameter and for polar coordinates, are compared with the true chord.',
  draw(ctx, stage, c) {
    const k = K();
    const s = (Math.min(stage.w, stage.h) / 2 - 16) / k.R;
    const [cx, cy] = [stage.w / 2, stage.h / 2];
    const P = ([x, y]) => [cx + x * s, cy - y * s];
    ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.beginPath();
    for (let j = 0; j <= 400; j++) { const t = (6.2832 * j) / 400; const [x, y] = P(pt(t)); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    const a = P(pt(state.t)); const b = P(pt(state.t + state.h)); const corner = [b[0], a[1]];
    line(ctx, a[0], a[1], corner[0], corner[1], { color: c.b, width: 3 });
    line(ctx, corner[0], corner[1], b[0], b[1], { color: c.b, width: 3 });
    line(ctx, a[0], a[1], b[0], b[1], { color: c.a, width: 4 });
    line(ctx, cx, cy, a[0], a[1], { color: c.grid, width: 1.5, dash: [4, 4] });
    dot(ctx, a[0], a[1], 5, c.a, c.ink);
  },
  controls: [
    { title: 'Take a small step' },
    { key: 'fn', label: 'Curve', options: Object.entries(CURVES).map(([k, v]) => [k, v.name]) },
    { key: 't', label: 'Where along the curve (θ)', min: 0.2, max: 6, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'h', label: 'Step size', min: 0.02, max: 0.8, step: 0.02, format: (v) => v.toFixed(2) },
    { readout: [
      ['True chord length', () => num(step().true, 6)],
      ['√(dx² + dy²) via y = f(x)', () => num(forms().dsXY, 6)],
      ['√(x′² + y′²) dt, parametric', () => num(forms().dsParam, 6)],
      ['√(r² + r′²) dθ, polar', () => num(forms().dsPolar, 6)],
    ] },
  ],
  tex: () => 'ds=\\sqrt{dx^2+dy^2}=\\sqrt{1+y\'^2}\\,dx=\\sqrt{x\'^2+y\'^2}\\,dt=\\sqrt{r^2+r\'^2}\\,d\\theta',
});
