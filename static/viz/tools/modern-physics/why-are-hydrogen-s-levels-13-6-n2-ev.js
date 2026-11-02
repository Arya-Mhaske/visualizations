import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { levelEv, HC } from './_mp.js';

// E_n = -13.6 / n^2 eV. The student raises the electron one rung at a time.
const state = { n: 1 };
const MAXN = 10;

const tool = createTool({
  state,
  label: 'An energy ladder for hydrogen. Horizontal lines are the allowed levels n equals 1 to 10, with 1 at minus 13.6 electron-volts and the rest crowding up towards zero. A coral dot sits on level n, and an arrow shows the climb to the next level and the energy that costs.',
  draw(ctx, stage, c) {
    const top = 26;
    const bottom = stage.h - 22;
    const y = (E) => top + ((0 - E) / 14.4) * (bottom - top);
    const x0 = 56;
    const x1 = stage.w - 16;
    line(ctx, x0, y(0), x1, y(0), { color: c.ink, width: 3, dash: [6, 4] });
    label(ctx, '0 (free)', x1, y(0) - 12, c, { size: 10, align: 'right', bounds: stage, patch: false });
    for (let n = 1; n <= MAXN; n++) {
      line(ctx, x0, y(levelEv(n)), x1 - 70, y(levelEv(n)), { color: n === state.n ? c.a : c.ink, width: n === state.n ? 4 : 2 });
      if (n <= 4 || n === state.n || n === MAXN) label(ctx, `n=${n}`, x0 - 4, y(levelEv(n)), c, { size: 10, align: 'right', patch: false });
    }
    const n = state.n;
    const ex = x0 + (x1 - 70 - x0) * 0.35;
    dot(ctx, ex, y(levelEv(n)), 8, c.a, c.ink);
    if (n < MAXN) {
      const ax = x0 + (x1 - 70 - x0) * 0.7;
      arrow(ctx, ax, y(levelEv(n)), ax, y(levelEv(n + 1)), { color: c.b, width: 3, head: 9 });
      const step = levelEv(n + 1) - levelEv(n);
      label(ctx, `${fixed(step, 2)} eV`, x1 - 32, (y(levelEv(n)) + y(levelEv(n + 1))) / 2, c, { size: 11, bounds: stage });
    }
  },
  controls: () => [
    { title: 'Climb the ladder' },
    { key: 'n', label: 'Electron in level n', min: 1, max: MAXN, step: 1 },
    { readout: [
      ['Energy E_n', (s) => `${fixed(levelEv(s.n), 2)} eV`],
      ['Cost to go up one rung', (s) => (s.n < MAXN ? `${fixed(levelEv(s.n + 1) - levelEv(s.n), 3)} eV` : '—')],
      ['Photon needed', (s) => (s.n < MAXN ? `${sig(HC / (levelEv(s.n + 1) - levelEv(s.n)), 3)} nm` : '—')],
      ['Cost to escape (ionise)', (s) => `${fixed(-levelEv(s.n), 2)} eV`],
    ] },
  ],
  tex: (s) => `E_{${s.n}}=-\\dfrac{13.6}{${s.n}^2}=${fixed(levelEv(s.n), 3)}\\ \\text{eV}`,
});

tool.update();
