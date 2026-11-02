import { createTool } from '../../lib/tool.js';
import { arrow, line, label } from '../../lib/draw.js';
import { mark } from './_charge.js';

// Between two plates with field E0 (to the right). Molecules in the slab become dipoles. Net field E = E0/K.
const state = { K: 3 };
const E = (s) => 1 / s.K;
const align = (s) => 1 - 1 / s.K; // fraction of E0 cancelled

createTool({
  state,
  label: 'Two charged plates with a slab of insulator between them. Each molecule in the slab is stretched into a small dipole, with its positive end towards the negative plate. The dipoles line up in rows, leaving a layer of negative charge on the face next to the positive plate and positive on the other face. These surface charges make a field that opposes the original one.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const [px0, px1, y0, y1] = [W * 0.1, W * 0.9, H * 0.14, H * 0.86];
    line(ctx, px0, y0, px0, y1, { color: c.a, width: 8 });
    line(ctx, px1, y0, px1, y1, { color: c.b, width: 8 });
    label(ctx, '+', px0 - 14, H * 0.5, c, { size: 16, bounds: stage, patch: false });
    label(ctx, '−', px1 + 14, H * 0.5, c, { size: 16, bounds: stage, patch: false });
    const [sx0, sx1] = [W * 0.28, W * 0.72];
    ctx.fillStyle = c.fillY;
    ctx.fillRect(sx0, y0 + 10, sx1 - sx0, y1 - y0 - 20);
    ctx.strokeStyle = c.ink; ctx.lineWidth = 3;
    ctx.strokeRect(sx0, y0 + 10, sx1 - sx0, y1 - y0 - 20);
    const half = 3 + 9 * align(state);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
      const x = sx0 + 28 + i * ((sx1 - sx0 - 56) / 4);
      const y = y0 + 40 + j * ((y1 - y0 - 80) / 3);
      mark(ctx, x - half, y, -1, c, 4);
      mark(ctx, x + half, y, 1, c, 4);
    }
    for (let j = 0; j < 4; j++) {
      const y = y0 + 30 + j * ((y1 - y0 - 60) / 3);
      arrow(ctx, px0 + 10, y, sx0 - 6, y, { color: c.a, width: 3, head: 8 });
      arrow(ctx, sx1 + 6, y, px1 - 10, y, { color: c.a, width: 3, head: 8 });
      const L = (sx1 - sx0 - 20) * E(state);
      arrow(ctx, (sx0 + sx1) / 2 - L / 2, y, (sx0 + sx1) / 2 + L / 2, y, { color: c.ink, width: 3, head: 8 });
    }
    label(ctx, `E = E₀ / ${state.K}`, W * 0.5, H * 0.95, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Insert a dielectric' },
    { key: 'K', label: 'Dielectric constant K', min: 1, max: 10, step: 1 },
    { readout: [
      ['Applied field E₀', () => '1.00'],
      ['Field from the dipoles', (s) => (-align(s)).toFixed(2)],
      ['Net field E', (s) => E(s).toFixed(2)],
    ] },
  ],
  tex: (s) => `E=E_0-E_{induced}=\\dfrac{E_0}{K}=\\dfrac{1}{${s.K}}=${E(s).toFixed(2)}`,
});
