import { createTool } from '../../lib/tool.js';
import { dot, label } from '../../lib/draw.js';
import { neutrality } from './_intrinsic-extrinsic-semiconductors-math.js';

const COLS = 8;
const ROWS = 5;
const ORDER = [9, 29, 18, 3, 35, 22, 12, 31, 6, 26]; // fixed spots for up to ten dopants
const state = { kind: 'n', d: 6, out: 0 };
const sign = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');

const tool = createTool({
  state,
  label: 'A patch of silicon lattice drawn as a grid of grey atoms. Dopant atoms are bigger circles marked with their fixed charge, plus for donors and minus for acceptors. Each has a free carrier of the opposite sign beside it, a small coral dot for an electron or a green ring for a hole. A box on the right collects any carriers you pull out.',
  draw(ctx, stage, c) {
    const win = { x: 8, y: 8, w: stage.w * 0.68, h: stage.h - 16 };
    const gx = win.w / COLS;
    const gy = win.h / ROWS;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(win.x, win.y, win.w, win.h);
    const n = state.kind === 'n';
    for (let i = 0; i < COLS * ROWS; i++) {
      const x = win.x + (i % COLS + 0.5) * gx;
      const y = win.y + (Math.floor(i / COLS) + 0.5) * gy;
      const k = ORDER.slice(0, state.d).indexOf(i);
      if (k < 0) {
        dot(ctx, x, y, 5, c.grid, null);
        continue;
      }
      dot(ctx, x, y, 12, c.fillY, c.ink);
      label(ctx, n ? '+' : '−', x, y, c, { size: 15, patch: false });
      if (k < state.d - state.out) {
        const cx = x + gx * 0.38;
        const cy = y - gy * 0.22;
        if (n) dot(ctx, cx, cy, 6, c.a, c.ink, 2);
        else dot(ctx, cx, cy, 6, c.paper, c.c, 3);
      }
    }
    const bx = win.x + win.w + 12;
    ctx.strokeRect(bx, win.y, stage.w - bx - 8, win.h);
    label(ctx, 'pulled out', bx + (stage.w - bx - 8) / 2, win.y + 14, c, { size: 10, bounds: stage, patch: false });
    for (let k = 0; k < state.out; k++) {
      const cx = bx + 18 + (k % 2) * 22;
      const cy = win.y + 40 + Math.floor(k / 2) * 24;
      if (n) dot(ctx, cx, cy, 6, c.a, c.ink, 2);
      else dot(ctx, cx, cy, 6, c.paper, c.c, 3);
    }
  },
  controls: () => [
    { title: 'Dope a patch' },
    { key: 'kind', label: 'Dopant', options: [['n', 'donors (n-type)'], ['p', 'acceptors (p-type)']] },
    { key: 'd', label: 'Dopant atoms', min: 1, max: 10, step: 1 },
    { key: 'out', label: 'Carriers pulled out', min: 0, max: 10, step: 1 },
    { readout: [
      ['Fixed cores', (s) => sign(neutrality(s.d, s.kind, Math.min(s.out, s.d)).fixed)],
      ['Free carriers', (s) => sign(neutrality(s.d, s.kind, Math.min(s.out, s.d)).mobile)],
      ['Net charge', (s) => {
        const { net } = neutrality(s.d, s.kind, Math.min(s.out, s.d));
        return { text: net === 0 ? '0, neutral' : `${sign(net)} e`, good: net === 0 };
      }],
    ] },
  ],
  onChange: (s) => { s.out = Math.min(s.out, s.d); },
  tex: (s) => {
    const r = neutrality(s.d, s.kind, Math.min(s.out, s.d));
    return `q=${r.fixed}e+(${r.mobile})e=${r.net}\\,e`;
  },
});

tool.update();
