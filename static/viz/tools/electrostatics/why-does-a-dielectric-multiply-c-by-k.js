import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { cap, pF } from './_cap.js';

// Isolated capacitor, fixed Q = 8 nC. A slab slides in; the covered share s behaves like a capacitor of C = K C0 s, the rest like C0 (1 − s), in parallel.
const Q = 8e-9;
const state = { s: 0.5, K: 4 };
const C0 = cap(100, 2);
const C = (st) => C0 * ((1 - st.s) + st.K * st.s);
const V = (st) => Q / C(st);

createTool({
  state,
  label: 'Two plates with a slab of dielectric sliding in from the right. The charge is fixed. As the slab goes in, the field in the covered region falls, the voltage falls, and the capacitance rises. With the slab fully in, the capacitance is K times larger.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const [x0, x1, y0, y1] = [W * 0.12, W * 0.88, H * 0.3, H * 0.62];
    line(ctx, x0, y0, x1, y0, { color: c.a, width: 8 });
    line(ctx, x0, y1, x1, y1, { color: c.b, width: 8 });
    const sx = x1 - (x1 - x0) * state.s;
    ctx.fillStyle = c.fillY;
    ctx.fillRect(sx, y0 + 6, x1 - sx, y1 - y0 - 12);
    ctx.strokeStyle = c.ink; ctx.lineWidth = 3;
    ctx.strokeRect(sx, y0 + 6, x1 - sx, y1 - y0 - 12);
    label(ctx, state.s > 0.15 ? `K = ${state.K}` : '', (sx + x1) / 2, (y0 + y1) / 2, c, { size: 13, bounds: stage, patch: false });
    // voltage bar
    const bh = (V({ s: 0, K: 1 }) ? (V(state) / V({ s: 0, K: 1 })) : 1) * (H * 0.2);
    ctx.fillStyle = c.fillC;
    ctx.fillRect(W * 0.45, H * 0.88 - bh, W * 0.1, bh);
    ctx.strokeRect(W * 0.45, H * 0.88 - H * 0.2, W * 0.1, H * 0.2);
    label(ctx, `V = ${V(state).toFixed(0)} V`, W * 0.5, H * 0.95, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Slide in a slab' },
    { key: 's', label: 'How far the slab is in', min: 0, max: 1, step: 0.1, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'K', label: 'Dielectric constant K', min: 1, max: 10, step: 1 },
    { readout: [
      ['C', (st) => `${pF(C(st)).toFixed(1)} pF`],
      ['C ÷ C₀', (st) => (C(st) / C0).toFixed(2)],
      ['Voltage V = Q/C', (st) => `${V(st).toFixed(0)} V`],
    ] },
  ],
  tex: (st) => `C=C_0\\left[(1-s)+Ks\\right]=${pF(C0).toFixed(1)}\\times ${(C(st) / C0).toFixed(2)}=${pF(C(st)).toFixed(1)}\\ \\mathrm{pF}`,
});
