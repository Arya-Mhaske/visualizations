import { createTool } from '../../lib/tool.js';
import { dot, label } from '../../lib/draw.js';

// Charges on the x axis at ±2 (k = 1). V adds as plain numbers. The map shades V: coral positive, blue negative.
const state = { q1: 1, q2: -1, px: 0, py: 2 };
const SRC = [[-2, 0], [2, 0]];
const Vat = (s, x, y) => [s.q1, s.q2].map((q, i) => q / Math.max(0.15, Math.hypot(x - SRC[i][0], y - SRC[i][1])));
const total = (s, x, y) => Vat(s, x, y).reduce((p, v) => p + v, 0);

createTool({
  state,
  label: 'A map of the electric potential around two charges, shaded coral where it is positive and blue where it is negative. A probe point shows the two separate potentials, one from each charge, and their plain sum.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const s = Math.min(W / 12, H / 10);
    const [ox, oy] = [W / 2, H / 2];
    const n = 48;
    const [cw, ch] = [W / n, H / n];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = total(state, ((i + 0.5) * cw - ox) / s, (oy - (j + 0.5) * ch) / s);
      ctx.fillStyle = v >= 0 ? c.a : c.b;
      ctx.globalAlpha = Math.min(0.85, Math.abs(v) * 0.35);
      ctx.fillRect(i * cw, j * ch, cw + 1, ch + 1);
    }
    ctx.globalAlpha = 1;
    SRC.forEach(([x, y], i) => { dot(ctx, ox + x * s, oy - y * s, 10, [state.q1, state.q2][i] >= 0 ? c.a : c.b, c.ink); label(ctx, `${[state.q1, state.q2][i]}`, ox + x * s, oy - y * s, c, { size: 10, patch: false }); });
    dot(ctx, ox + state.px * s, oy - state.py * s, 7, c.c, c.ink, 2);
    label(ctx, 'probe', ox + state.px * s, oy - state.py * s - 14, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Add potentials' },
    { key: 'q1', label: 'Left charge', min: -3, max: 3, step: 1 },
    { key: 'q2', label: 'Right charge', min: -3, max: 3, step: 1 },
    { key: 'px', label: 'Probe x', min: -5, max: 5, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'py', label: 'Probe y', min: -4, max: 4, step: 0.5, format: (v) => v.toFixed(1) },
    { readout: [
      ['V from left', (s) => Vat(s, s.px, s.py)[0].toFixed(3)],
      ['V from right', (s) => Vat(s, s.px, s.py)[1].toFixed(3)],
      ['V total', (s) => total(s, s.px, s.py).toFixed(3)],
    ] },
  ],
  tex: (s) => `V=\\dfrac{kq_1}{r_1}+\\dfrac{kq_2}{r_2}=${Vat(s, s.px, s.py)[0].toFixed(3)}+(${Vat(s, s.px, s.py)[1].toFixed(3)})=${total(s, s.px, s.py).toFixed(3)}`,
});
