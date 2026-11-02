import { createTool } from '../../lib/tool.js';
import { label, line } from '../../lib/draw.js';
import { cyclesOf, lcm } from './_aa-math.js';
import { specFill } from './_aa-view.js';

// A perfect riffle shuffle is a permutation of positions 0..n-1 (n even). Out: the top card stays on top.
// In: the top card goes to second place. How many repeats bring the deck back? The order of that permutation.
const state = { n: 52, mode: 'out', k: 1 };
export const shuffleMap = (n, mode) => [...Array(n).keys()].map((i) => (mode === 'out' ? (i === n - 1 ? n - 1 : (2 * i) % (n - 1)) : (2 * i + 1) % (n + 1)));
export const shuffleOrder = (n, mode) => cyclesOf(shuffleMap(n, mode)).reduce((acc, cy) => lcm(acc, cy.length), 1);
const after = (n, mode, k) => {
  const p = shuffleMap(n, mode);
  let pos = [...Array(n).keys()];
  for (let j = 0; j < k; j++) pos = pos.map((x) => p[x]);
  return pos;
};

createTool({
  state,
  label: 'Two rows of cards. The top row is the deck before shuffling, the bottom row is the deck after k perfect riffle shuffles. Lines join each card to its new place. The panel gives the number of shuffles needed to restore the deck.',
  draw(ctx, stage, c) {
    const n = state.n;
    const pos = after(n, state.mode, state.k);
    const w = (stage.w - 24) / n;
    const [yTop, yBot, h] = [stage.h * 0.18, stage.h * 0.72, Math.min(stage.h * 0.16, 60)];
    pos.forEach((to, from) => line(ctx, 12 + w * (from + 0.5), yTop + h, 12 + w * (to + 0.5), yBot, { color: c.grid, width: 1 }));
    pos.forEach((to, from) => {
      ctx.fillStyle = specFill(c, from);
      ctx.fillRect(12 + w * to, yBot, Math.max(w - 1, 1), h);
      ctx.fillRect(12 + w * from, yTop, Math.max(w - 1, 1), h);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1;
      ctx.strokeRect(12 + w * to, yBot, Math.max(w - 1, 1), h);
      ctx.strokeRect(12 + w * from, yTop, Math.max(w - 1, 1), h);
    });
    label(ctx, 'before', stage.w / 2, yTop - 14, c, { size: 12 });
    label(ctx, `after ${state.k} shuffle${state.k === 1 ? '' : 's'}`, stage.w / 2, yBot + h + 16, c, { size: 12, bounds: stage });
    if (pos.every((x, i) => x === i)) label(ctx, 'back to the start', stage.w / 2, stage.h / 2, c, { size: 14, color: c.ink });
  },
  controls: [
    { title: 'Shuffle perfectly' },
    { key: 'n', label: 'Cards in the deck', min: 2, max: 52, step: 2 },
    { key: 'mode', label: 'Shuffle', options: [['out', 'Out (top stays top)'], ['in', 'In (top goes second)']] },
    { key: 'k', label: 'Shuffles done', min: 0, max: 60, step: 1 },
    { readout: [
      ['Shuffles to restore', (s) => String(shuffleOrder(s.n, s.mode))],
      ['Deck restored now?', (s) => { const ok = after(s.n, s.mode, s.k).every((x, i) => x === i); return { text: ok ? 'yes' : 'no', good: ok }; }],
      ['Card at the top is', (s) => `original card ${after(s.n, s.mode, s.k).indexOf(0) + 1}`],
    ] },
  ],
  tex: (s) => `\\text{order}=${shuffleOrder(s.n, s.mode)}${s.n === 52 ? (s.mode === 'out' ? ',\\quad 2^{8}\\equiv 1\\pmod{51}' : ',\\quad 2^{52}\\equiv 1\\pmod{53}') : ''}`,
});
