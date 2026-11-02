import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { createRng } from '../../lib/rng.js';
import { cyclesOf, identityPerm, inversions } from './_aa-math.js';
import { spec } from './_aa-view.js';

// Start from the identity and swap two entries at a time. A swap always changes the number of crossings by an odd number,
// so after s swaps the crossings have the parity of s: the same permutation can never be both even and odd.
const N = 6;
const state = { a: 1, b: 4 };
const rng = createRng(5);
let perm = identityPerm(N);
let history = [];
let lastDelta = null;

function swap(a, b) {
  if (a === b) return;
  const before = inversions(perm);
  [perm[a], perm[b]] = [perm[b], perm[a]];
  history.push([a, b]);
  lastDelta = inversions(perm) - before;
}

const tool = createTool({
  state,
  label: 'Two rows of six dots joined by lines. The top row is 1 to 6 in order and the bottom row is the current arrangement. The number of crossings between lines changes by an odd amount with every swap.',
  draw(ctx, stage, c) {
    const [top, bottom] = [stage.h * 0.2, stage.h * 0.8];
    const x = (i) => 30 + ((stage.w - 60) * i) / (N - 1);
    perm.forEach((v, i) => line(ctx, x(i), top, x(v), bottom, { color: spec(c, i), width: 3.5 }));
    // after the permutation, element i sits at position perm[i]
    for (let i = 0; i < N; i++) {
      dot(ctx, x(i), top, 12, c.paper, c.ink);
      label(ctx, String(i + 1), x(i), top, c, { size: 12, patch: false });
      dot(ctx, x(i), bottom, 12, c.paper, c.ink);
      const who = perm.indexOf(i);
      label(ctx, String(who + 1), x(i), bottom, c, { size: 12, patch: false });
    }
    label(ctx, `crossings: ${inversions(perm)}   swaps: ${history.length}`, stage.w / 2, stage.h / 2, c, { size: 14, bounds: stage });
  },
  controls: (t) => [
    { title: 'Swap, again and again' },
    { key: 'a', label: 'Swap place a …', min: 1, max: N, step: 1 },
    { key: 'b', label: '… with place b', min: 1, max: N, step: 1 },
    { row: [
      { button: 'Swap', onClick() { swap(state.a - 1, state.b - 1); t.update(); } },
      { button: 'Random swap', ghost: true, onClick() { const a = rng.int(0, N - 1); let b = rng.int(0, N - 2); if (b >= a) b++; swap(a, b); t.update(); } },
    ] },
    { row: [
      { button: 'Undo', ghost: true, onClick() { const last = history.pop(); if (last) { [perm[last[0]], perm[last[1]]] = [perm[last[1]], perm[last[0]]]; lastDelta = null; } t.update(); } },
      { button: 'Reset', ghost: true, onClick() { perm = identityPerm(N); history = []; lastDelta = null; t.update(); } },
    ] },
    { readout: [
      ['Swaps made, s', () => String(history.length)],
      ['Crossings', () => String(inversions(perm))],
      ['Last swap changed crossings by', () => (lastDelta === null ? 'no swap yet' : `${lastDelta > 0 ? '+' : '−'}${Math.abs(lastDelta)}`)],
      ['s and crossings', () => { const same = history.length % 2 === inversions(perm) % 2; return { text: same ? 'same parity' : 'different', good: same }; }],
      ['Cycles', () => String(cyclesOf(perm).length)],
      ['Permutation is', () => (inversions(perm) % 2 === 0 ? 'even' : 'odd')],
    ] },
  ],
});
void tool;
