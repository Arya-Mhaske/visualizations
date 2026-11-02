import { createTool } from '../../lib/tool.js';
import { dot, label } from '../../lib/draw.js';
import { bars } from '../../lib/quick.js';
import { nCr } from './_counting.js';

const state = { n: 7, r: 2 };

createTool({
  state,
  label: 'A row of n counters of which r are marked as taken, then the same row with the other n minus r marked. Below, bars of C(n, k) for every k, which are symmetrical.',
  draw(ctx, stage, c) {
    const gap = (stage.w - 30) / Math.max(state.n, 1);
    for (let i = 0; i < state.n; i++) {
      dot(ctx, 20 + gap * (i + 0.5), 26, 9, i < state.r ? c.a : c.paper, c.ink, 2);
      dot(ctx, 20 + gap * (i + 0.5), 64, 9, i < state.n - state.r ? c.b : c.paper, c.ink, 2);
    }
    label(ctx, `take ${state.r}`, 6, 26, c, { size: 10, align: 'left', patch: false });
    label(ctx, `take ${state.n - state.r}`, 6, 64, c, { size: 10, align: 'left', patch: false });
    ctx.save();
    ctx.translate(0, 84);
    bars(ctx, { w: stage.w, h: stage.h - 84 }, c, Array.from({ length: state.n + 1 }, (_, k) => [`k = ${k}`, nCr(state.n, k), k === state.r ? c.a : k === state.n - state.r ? c.b : c.fillC, String(nCr(state.n, k))]), { max: nCr(state.n, Math.floor(state.n / 2)), top: 4, gap: 4, left: 0.18 });
    ctx.restore();
  },
  controls: [
    { title: 'Take or leave' },
    { key: 'n', label: 'Things n', min: 2, max: 10, step: 1 },
    { key: 'r', label: 'Take r', min: 0, max: 10, step: 1 },
    { readout: [
      ['C(n, r)', (s) => String(nCr(s.n, s.r))],
      ['C(n, n − r)', (s) => String(nCr(s.n, s.n - s.r))],
    ] },
  ],
  tex: (s) => `C(${s.n},${s.r})=C(${s.n},${s.n - s.r})=${nCr(s.n, s.r)}`,
  onChange: (s) => {
    s.r = Math.min(s.r, s.n);
  },
});
