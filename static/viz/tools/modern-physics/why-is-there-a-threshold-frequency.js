import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { H, Q, METALS, phiOf } from './_mp.js';

// Electrons sit in a well of depth phi. One photon lifts one electron by h*nu, never by a share of many.
const state = { nu: 4.0, metal: 'Na', n: 4 };
const evOf = (nu14) => (H * nu14 * 1e14) / Q;

const tool = createTool({
  state,
  label: 'An energy well. The top edge is outside the metal, level zero. Electrons sit at the bottom of the well, at minus phi. Each electron is lifted by one photon: a coral arrow of the same height for all electrons. If the arrow reaches the top edge the electron leaves, otherwise it falls back.',
  draw(ctx, stage, c) {
    const { w, h } = stage;
    const phi = phiOf(state.metal);
    const E = evOf(state.nu);
    const top = h * 0.14;
    const bottom = h * 0.86;
    const scale = (bottom - top) / 7; // pixels per eV, 7 eV from top to the floor of the picture
    const yOf = (e) => top - e * scale; // e = 0 is the top edge; negative e is below
    const x0 = 36;
    ctx.fillStyle = c.fillB;
    ctx.fillRect(x0, yOf(0) + 0, w - x0 - 10, h - yOf(0) - 10);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(x0, yOf(0), w - x0 - 10, h - yOf(0) - 10);
    label(ctx, 'outside the metal (0 eV)', w * 0.62, yOf(0) - 14, c, { size: 11, bounds: stage, patch: false });
    line(ctx, x0, yOf(-phi), w - 10, yOf(-phi), { color: c.ink, width: 2, dash: [6, 4] });
    label(ctx, `−φ₀ = −${fixed(phi, 2)} eV`, x0 + 6, yOf(-phi) + 14, c, { size: 11, align: 'left', patch: false });
    const escapes = E >= phi;
    const gap = (w - x0 - 40) / state.n;
    for (let i = 0; i < state.n; i++) {
      const x = x0 + 24 + gap * (i + 0.5);
      const yEnd = yOf(-phi + E);
      arrow(ctx, x, yOf(-phi), x, Math.max(yEnd, 12), { color: c.a, width: 3, head: 8 });
      dot(ctx, x, escapes ? Math.max(yEnd, 12) : yOf(-phi), 7, escapes ? c.a : c.paper, c.ink);
      if (!escapes) dot(ctx, x, yEnd, 4, c.paper, c.ink, 2);
    }
    label(ctx, escapes ? 'each one escapes' : 'each one falls back', w * 0.6, yOf(-phi) + 34, c, { size: 12, bounds: stage });
  },
  controls: () => [
    { title: 'Lift electrons out' },
    { key: 'nu', label: 'Frequency ν', min: 2, max: 14, step: 0.1, format: (v) => `${fixed(v, 1)} ×10¹⁴ Hz` },
    { key: 'metal', label: 'Metal', options: METALS.map(([k]) => [k, k]) },
    { key: 'n', label: 'Brightness (electrons hit)', min: 1, max: 6, step: 1 },
    { readout: [
      ['Photon energy, hν', (s) => `${fixed(evOf(s.nu), 2)} eV`],
      ['Work function, φ₀', (s) => `${fixed(phiOf(s.metal), 2)} eV`],
      ['Threshold ν₀ = φ₀/h', (s) => `${fixed((phiOf(s.metal) * Q) / H / 1e14, 2)} ×10¹⁴ Hz`],
      ['Result', (s) => ({ text: evOf(s.nu) >= phiOf(s.metal) ? 'electrons escape' : 'none escape', good: evOf(s.nu) >= phiOf(s.metal) })],
    ] },
  ],
  tex: (s) => `\\nu_0=\\dfrac{\\phi_0}{h}=${fixed((phiOf(s.metal) * Q) / H / 1e14, 2)}\\times10^{14}\\ \\text{Hz}`,
});

tool.update();
