import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';

// Moment of inertia I = ∫ r² dm: every bit of mass counts by its distance squared from the axis. Body: a uniform disk, I = ½Ma².
// Arms: two masses m at distance d, adding 2md². With no outside torque L = Iω stays fixed, so ω = L/I.
const state = { d: 0.8 };
const M = 50;
const A = 0.2;
const m = 4;
const W0 = 2;
const I0 = 0.5 * M * A * A;
export const inertia = (d) => I0 + 2 * m * d * d;
const L = inertia(0.8) * W0;
export const omega = (d) => L / inertia(d);

createTool({
  state,
  label: 'A view from above of a skater: a body disk with a mass held out on each arm. Two bars show the moment of inertia, split into body and arms, and the spin rate. Bringing the arms in shrinks the moment of inertia, so the spin rate rises to keep angular momentum the same.',
  draw(ctx, stage, c) {
    const [cx, cy] = [stage.w / 2, stage.h * 0.3];
    const k = Math.min(stage.w * 0.4, 130) / 0.9;
    dot(ctx, cx, cy, A * k, c.fillB, c.ink);
    line(ctx, cx - state.d * k, cy, cx + state.d * k, cy, { color: c.ink, width: 4 });
    [-1, 1].forEach((s) => dot(ctx, cx + s * state.d * k, cy, 10, c.fillA, c.ink));
    label(ctx, `arms at d = ${state.d.toFixed(2)} m`, cx, cy + k * 0.95 + 8, c, { size: 11, bounds: stage });
    const [bx, by, bw] = [20, stage.h * 0.62, stage.w - 40];
    const Imax = inertia(0.8);
    const body = (I0 / Imax) * bw;
    const arms = ((2 * m * state.d * state.d) / Imax) * bw;
    ctx.fillStyle = c.fillB;
    ctx.fillRect(bx, by, body, 26);
    ctx.fillStyle = c.fillA;
    ctx.fillRect(bx + body, by, arms, 26);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, body + arms, 26);
    label(ctx, `I = ${inertia(state.d).toFixed(2)} kg m²`, stage.w / 2, by - 12, c, { size: 12, bounds: stage });
    const wmax = omega(0.1);
    ctx.fillStyle = c.fillC;
    ctx.fillRect(bx, by + 56, (omega(state.d) / wmax) * bw, 26);
    ctx.strokeRect(bx, by + 56, (omega(state.d) / wmax) * bw, 26);
    label(ctx, `ω = ${omega(state.d).toFixed(2)} rad/s`, stage.w / 2, by + 44, c, { size: 12, bounds: stage });
  },
  controls: [
    { title: 'Move the arms' },
    { key: 'd', label: 'Arm distance, d (m)', min: 0.1, max: 0.8, step: 0.01, format: (v) => v.toFixed(2) },
    { readout: [
      ['Body part of I', () => `${I0.toFixed(2)} kg m²`],
      ['Arm part of I', (s) => `${(2 * m * s.d * s.d).toFixed(3)} kg m²`],
      ['L = Iω', () => `${L.toFixed(2)} kg m²/s (fixed)`],
      ['Spin rate', (s) => `${omega(s.d).toFixed(2)} rad/s`],
    ] },
  ],
  tex: (s) => `I=\\int r^2\\,dm=${inertia(s.d).toFixed(2)},\\quad \\omega=\\dfrac{L}{I}=${omega(s.d).toFixed(2)}`,
});
