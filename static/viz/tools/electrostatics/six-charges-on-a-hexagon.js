import { createTool } from '../../lib/tool.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { hexPoints } from './_potential.js';

// Six equal-size charges at the corners of a hexagon of side a (cm), q in µC. V = 9×10⁵ Σ q/a volts (a in cm gives ×10⁻²); E is the vector sum at the centre.
const PRESETS = {
  all: [1, 1, 1, 1, 1, 1],
  alt: [1, -1, 1, -1, 1, -1],
  half: [1, 1, 1, -1, -1, -1],
  gone: [0, 1, 1, 1, 1, 1],
};
const state = { set: 'all', q: 2, a: 10 };
const qs = (s) => PRESETS[s.set].map((k) => k * s.q);
const V = (s) => qs(s).reduce((p, q) => p + (9e9 * q * 1e-6) / (s.a * 1e-2), 0);
const E = (s) => hexPoints(s.a).reduce(([ex, ey], [x, y], i) => {
  const f = (9e9 * qs(s)[i] * 1e-6) / (s.a * 1e-2) ** 2; // pushes the centre away from the charge
  return [ex - (f * x) / s.a, ey - (f * y) / s.a];
}, [0, 0]);
const sciV = (v) => (Math.abs(v) < 1e-6 ? '0' : `${(v / 1000).toFixed(0)} kV`);

createTool({
  state,
  label: 'Six charges at the corners of a regular hexagon, with the field at the centre drawn as an arrow. The potential at the centre is just the sum of six numbers. The field there is the vector sum of six arrows. All positive, or alternating, give zero field. All positive gives a large potential and alternating gives none.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const s = Math.min(W, H) * 0.34 / state.a;
    const [ox, oy] = [W / 2, H / 2];
    hexPoints(state.a).forEach(([x, y], i) => {
      const q = qs(state)[i];
      const [px, py] = [ox + x * s, oy - y * s];
      dot(ctx, px, py, q === 0 ? 5 : 13, q === 0 ? c.paper : q > 0 ? c.a : c.b, c.ink);
      label(ctx, q === 0 ? 'gone' : `${q > 0 ? '+' : ''}${q}`, px, py, c, { size: 10, patch: false });
    });
    dot(ctx, ox, oy, 6, c.c, c.ink, 2);
    const [ex, ey] = E(state);
    const m = Math.hypot(ex, ey);
    if (m > 1) arrow(ctx, ox, oy, ox + (ex / m) * Math.min(H * 0.3, 40 + m / 2e5), oy - (ey / m) * Math.min(H * 0.3, 40 + m / 2e5), { color: c.ink, width: 4, head: 11 });
    label(ctx, 'centre', ox, oy + 18, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Fill the hexagon' },
    { key: 'set', label: 'Charges', options: [['all', 'All +'], ['alt', '+ − + − + −'], ['half', '+++ −−−'], ['gone', 'One missing']] },
    { key: 'q', label: 'Charge size (µC)', min: 1, max: 5, step: 1 },
    { key: 'a', label: 'Side a (cm)', min: 5, max: 20, step: 5 },
    { readout: [
      ['V at centre', (s) => sciV(V(s))],
      ['|E| at centre', (s) => `${(Math.hypot(...E(s)) / 1e6).toFixed(2)} × 10⁶ V/m`],
    ] },
  ],
  tex: (s) => `V=\\sum\\dfrac{kq_i}{a}=${sciV(V(s)).replace(' kV', '\\ \\mathrm{kV}')}`,
});
