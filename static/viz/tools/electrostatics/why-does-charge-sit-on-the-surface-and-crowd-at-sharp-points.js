import { createTool } from '../../lib/tool.js';
import { dot, line, label } from '../../lib/draw.js';

// Two conducting spheres joined by a wire share one potential V = kq/R, so q ∝ R. σ = q / (4πR²) ∝ 1/R, and E at the surface ∝ σ.
const state = { R1: 4, R2: 1, Q: 10 };
const q1 = (s) => (s.Q * s.R1) / (s.R1 + s.R2);
const q2 = (s) => (s.Q * s.R2) / (s.R1 + s.R2);
const sigma = (q, R) => q / (4 * Math.PI * R * R);

createTool({
  state,
  label: 'A large and a small conducting sphere joined by a wire. Dots mark the charge on each surface. The large sphere holds more charge in total but the small sphere has more charge per unit area, and so a stronger field at its surface. A sharp point is like a very small sphere.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const k = Math.min(W * 0.075, H * 0.1);
    const [y0, x1, x2] = [H * 0.5, W * 0.12 + state.R1 * k, W * 0.88 - state.R2 * k];
    line(ctx, x1 + state.R1 * k, y0, x2 - state.R2 * k, y0, { color: c.ink, width: 3 });
    [[x1, state.R1, q1(state)], [x2, state.R2, q2(state)]].forEach(([x, R, q], i) => {
      ctx.beginPath();
      ctx.arc(x, y0, R * k, 0, Math.PI * 2);
      ctx.fillStyle = c.fillY;
      ctx.fill();
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 4;
      ctx.stroke();
      const n = Math.round(q * 2.2);
      for (let j = 0; j < n; j++) { const a = (j / n) * Math.PI * 2; dot(ctx, x + Math.cos(a) * (R * k + 7), y0 + Math.sin(a) * (R * k + 7), 3.2, c.a, c.ink, 1); }
      label(ctx, i ? 'small' : 'large', x, y0 + R * k + 24, c, { size: 11, bounds: stage, patch: false });
    });
  },
  controls: [
    { title: 'Join two spheres' },
    { key: 'R1', label: 'Large sphere radius', min: 2, max: 5, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'R2', label: 'Small sphere radius', min: 0.5, max: 2, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'Q', label: 'Total charge (arbitrary)', min: 4, max: 20, step: 2 },
    { readout: [
      ['Charge: large, small', (s) => `${q1(s).toFixed(2)}, ${q2(s).toFixed(2)}`],
      ['σ: large, small', (s) => `${sigma(q1(s), s.R1).toFixed(3)}, ${sigma(q2(s), s.R2).toFixed(3)}`],
      ['σ small ÷ σ large', (s) => `${(sigma(q2(s), s.R2) / sigma(q1(s), s.R1)).toFixed(2)} = R₁/R₂ = ${(s.R1 / s.R2).toFixed(2)}`],
    ] },
  ],
  tex: (s) => `\\dfrac{\\sigma_2}{\\sigma_1}=\\dfrac{R_1}{R_2}=\\dfrac{${s.R1.toFixed(1)}}{${s.R2.toFixed(1)}}=${(s.R1 / s.R2).toFixed(2)}`,
});
