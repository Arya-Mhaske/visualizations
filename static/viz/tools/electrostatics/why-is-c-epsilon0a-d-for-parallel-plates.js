import { createTool } from '../../lib/tool.js';
import { line, arrow, label } from '../../lib/draw.js';
import { cap, pF, EPS0 } from './_cap.js';

// Fixed charge Q = 8 nC. σ = Q/A, E = σ/ε₀ (does not depend on d), V = E d, C = Q/V.
const Q = 8e-9;
const state = { A: 100, d: 2 };
const sigma = (s) => Q / (s.A * 1e-4);
const E = (s) => sigma(s) / EPS0;
const V = (s) => E(s) * s.d * 1e-3;

createTool({
  state,
  label: 'Side view of two parallel plates carrying a fixed charge. Wider plates spread the charge thinner and weaken the field. A smaller gap leaves the field the same but gives it less distance to act over, so the voltage drops. Both changes raise the capacitance.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const half = (W * 0.38 * Math.sqrt(state.A / 200));
    const gap = 14 + state.d * (H * 0.09);
    const [cx, cy] = [W / 2, H * 0.48];
    line(ctx, cx - half, cy - gap / 2, cx + half, cy - gap / 2, { color: c.a, width: 8 });
    line(ctx, cx - half, cy + gap / 2, cx + half, cy + gap / 2, { color: c.b, width: 8 });
    const n = 7;
    const L = Math.max(10, Math.min(gap - 4, 14 + 4 * (sigma(state) / 8e-6)));
    for (let i = 0; i < n; i++) {
      const x = cx - half + ((i + 0.5) / n) * 2 * half;
      arrow(ctx, x, cy - gap / 2 + 6, x, cy + gap / 2 - 6, { color: c.ink, width: Math.max(1.5, 4 * (sigma(state) / 8e-6)), head: 7 });
    }
    void L;
    label(ctx, `A = ${state.A} cm²`, cx, cy - gap / 2 - 18, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `d = ${state.d} mm`, cx + half + 6, cy, c, { size: 11, align: 'left', bounds: stage, patch: false });
    label(ctx, `C = ${pF(cap(state.A, state.d)).toFixed(1)} pF`, cx, H * 0.9, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Reshape the plates' },
    { key: 'A', label: 'Plate area A (cm²)', min: 25, max: 200, step: 25 },
    { key: 'd', label: 'Gap d (mm)', min: 0.5, max: 4, step: 0.5, format: (v) => v.toFixed(1) },
    { readout: [
      ['Charge density σ = Q/A', (s) => `${(sigma(s) * 1e6).toFixed(2)} µC/m²`],
      ['Field E = σ/ε₀', (s) => `${(E(s) / 1e3).toFixed(0)} kV/m`],
      ['Voltage V = E d', (s) => `${V(s).toFixed(0)} V`],
      ['C = Q/V', (s) => `${pF(Q / V(s)).toFixed(1)} pF`],
    ] },
  ],
  tex: (s) => `C=\\dfrac{Q}{V}=\\dfrac{Q}{(Q/\\varepsilon_0A)\\,d}=\\dfrac{\\varepsilon_0A}{d}=${pF(cap(s.A, s.d)).toFixed(1)}\\ \\mathrm{pF}`,
});
