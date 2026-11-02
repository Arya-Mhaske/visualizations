import { createTool } from '../../lib/tool.js';
import { arrow, dot, line, label } from '../../lib/draw.js';
import { pithAngle, pithCharge, g } from './_coulomb.js';

const state = { mode: 'q', q: 50, L: 50, m: 1, deg: 8 };
const mkg = (s) => s.m * 1e-3;
const theta = (s) => (s.mode === 'q' ? pithAngle(s.q * 1e-9, s.L / 100, mkg(s)) : (s.deg * Math.PI) / 180);
const charge = (s) => (s.mode === 'q' ? s.q * 1e-9 : pithCharge(theta(s), s.L / 100, mkg(s)));

createTool({
  state,
  label: 'Two small charged balls hang from the same point on threads. They push each other apart until the thread tension, the weight and the electric force balance. A force triangle at the right-hand ball shows the three forces. The angle and the charge are linked by tan of the angle equals the electric force over the weight.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const th = theta(state);
    const len = H * 0.62;
    const [cx, top] = [W / 2, H * 0.08];
    const bx = [cx - Math.sin(th) * len, cx + Math.sin(th) * len];
    const by = top + Math.cos(th) * len;
    line(ctx, W * 0.3, top, W * 0.7, top, { color: c.ink, width: 4 });
    bx.forEach((x) => { line(ctx, cx, top, x, by, { color: c.ink, width: 2 }); dot(ctx, x, by, 11, c.a, c.ink); });
    line(ctx, cx, top, cx, by, { color: c.grid, width: 1, dash: [4, 4] });
    const Fe = mkg(state) * g * Math.tan(th);
    const k = (H * 0.25) / (mkg(state) * g);
    arrow(ctx, bx[1], by, bx[1] + Fe * k, by, { color: c.b, width: 3, head: 9 });
    arrow(ctx, bx[1], by, bx[1], by + mkg(state) * g * k, { color: c.ink, width: 3, head: 9 });
    arrow(ctx, bx[1], by, bx[1] - Math.sin(th) * (mkg(state) * g * k) / Math.cos(th), by - mkg(state) * g * k, { color: c.d, width: 3, head: 9 });
    label(ctx, 'F', bx[1] + Fe * k + 10, by - 8, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'mg', bx[1] + 14, by + mkg(state) * g * k, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'T', bx[1] - 16, by - mkg(state) * g * k * 0.6, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `θ = ${((th * 180) / Math.PI).toFixed(1)}°`, cx, top + 24, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Two equal pith balls' },
    { key: 'mode', label: 'Find', options: [['q', 'Angle from q'], ['a', 'Charge from angle']] },
    { key: 'q', label: 'Charge on each (nC)', min: 5, max: 100, step: 5 },
    { key: 'deg', label: 'Half-angle θ (°)', min: 2, max: 30, step: 1 },
    { key: 'L', label: 'Thread length (cm)', min: 20, max: 100, step: 10 },
    { key: 'm', label: 'Mass of each ball (g)', min: 0.1, max: 2, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['Half-angle θ', (s) => `${((theta(s) * 180) / Math.PI).toFixed(1)}°`],
      ['Separation', (s) => `${(2 * (s.L) * Math.sin(theta(s))).toFixed(1)} cm`],
      ['Charge each', (s) => `${(charge(s) * 1e9).toFixed(1)} nC`],
      ['Force F = mg tanθ', (s) => `${(mkg(s) * g * Math.tan(theta(s)) * 1e3).toFixed(3)} mN`],
    ] },
  ],
  tex: (s) => `\\dfrac{kq^{2}}{(2L\\sin\\theta)^{2}}=mg\\tan\\theta\\ \\Rightarrow\\ q=${(charge(s) * 1e9).toFixed(1)}\\ \\mathrm{nC}`,
});
