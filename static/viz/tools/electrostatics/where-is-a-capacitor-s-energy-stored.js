import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { cap, EPS0, pF } from './_cap.js';

const state = { V: 200, A: 100, d: 1 };
const C = (s) => cap(s.A, s.d);
const U = (s) => 0.5 * C(s) * s.V * s.V;
const E = (s) => s.V / (s.d * 1e-3);
const u = (s) => 0.5 * EPS0 * E(s) ** 2;
const vol = (s) => s.A * 1e-4 * s.d * 1e-3;
const uJ = (x) => `${(x * 1e6).toFixed(3)} µJ`;

createTool({
  state,
  label: 'Two parallel plates with the space between them shaded. The shaded volume is the field region. The energy stored equals the energy density, one half epsilon zero E squared, times that volume. This matches one half C V squared.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const half = W * 0.36 * Math.sqrt(state.A / 200);
    const gap = 12 + state.d * H * 0.08;
    const [cx, cy] = [W / 2, H * 0.45];
    ctx.fillStyle = c.fillY;
    ctx.globalAlpha = Math.min(1, 0.3 + (u(state) / 5e-3) * 0.7);
    ctx.fillRect(cx - half, cy - gap / 2, 2 * half, gap);
    ctx.globalAlpha = 1;
    line(ctx, cx - half, cy - gap / 2, cx + half, cy - gap / 2, { color: c.a, width: 8 });
    line(ctx, cx - half, cy + gap / 2, cx + half, cy + gap / 2, { color: c.b, width: 8 });
    label(ctx, 'energy lives in the field between the plates', cx, cy + gap / 2 + 26, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `½CV² = ${uJ(U(state))}`, cx, H * 0.8, c, { size: 13, bounds: stage, patch: false });
    label(ctx, `½ε₀E² × Ad = ${uJ(u(state) * vol(state))}`, cx, H * 0.9, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Charge a capacitor' },
    { key: 'V', label: 'Voltage V (V)', min: 50, max: 500, step: 50 },
    { key: 'A', label: 'Plate area A (cm²)', min: 25, max: 200, step: 25 },
    { key: 'd', label: 'Gap d (mm)', min: 0.5, max: 4, step: 0.5, format: (v) => v.toFixed(1) },
    { readout: [
      ['C', (s) => `${pF(C(s)).toFixed(1)} pF`],
      ['Field E = V/d', (s) => `${(E(s) / 1e3).toFixed(0)} kV/m`],
      ['Energy density', (s) => `${u(s).toFixed(4)} J/m³`],
      ['Volume A d', (s) => `${(vol(s) * 1e6).toFixed(2)} cm³`],
    ] },
  ],
  tex: (s) => `U=\\tfrac12CV^{2}=\\tfrac12\\varepsilon_0E^{2}\\,(Ad)=${uJ(U(s)).replace('µJ', '\\ \\mu\\mathrm{J}')}`,
});
