import { createTool } from '../../lib/tool.js';
import { bars } from '../../lib/quick.js';
import { fact, letterCounts, distinctArrangements } from './_counting.js';

const WORDS = ['BANANA', 'MISSISSIPPI', 'ALLAHABAD', 'COMMITTEE', 'MATHS'];
const state = { w: 'MISSISSIPPI' };

createTool({
  state,
  label: 'Two bars, the number of orders if every letter were different and the number of distinct words after removing swaps of equal letters. The second is much smaller when letters repeat.',
  draw(ctx, stage, c) {
    const all = fact(state.w.length);
    bars(ctx, stage, c, [['n! (all different)', all, c.fillB, String(all)], ['distinct words', distinctArrangements(state.w), c.fillA, String(distinctArrangements(state.w))]], { left: 0.3 });
  },
  controls: [
    { title: 'Pick a word' },
    { key: 'w', label: 'Word', options: WORDS.map((w) => [w, w]) },
    { readout: [
      ['Letters n', (s) => String(s.w.length)],
      ['Repeats', (s) => letterCounts(s.w).filter(([, k]) => k > 1).map(([l, k]) => `${l}×${k}`).join(' ') || 'none'],
      ['Divide by', (s) => letterCounts(s.w).filter(([, k]) => k > 1).map(([, k]) => `${k}!`).join(' × ') || '1'],
      ['Distinct arrangements', (s) => String(distinctArrangements(s.w))],
    ] },
  ],
  tex: (s) => `\\dfrac{${s.w.length}!}{${letterCounts(s.w).filter(([, k]) => k > 1).map(([, k]) => `${k}!`).join('\\,') || '1'}}=${distinctArrangements(s.w)}`,
});
