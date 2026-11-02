import { createTool } from '../../lib/tool.js';
import { bars } from '../../lib/quick.js';
import { fact } from './_counting.js';

const state = { n: 5 };

createTool({
  state,
  label: 'Bars for k factorial from zero up to n. Each bar is k times the one before, and the first bar, zero factorial, is one.',
  draw(ctx, stage, c) {
    bars(ctx, stage, c, Array.from({ length: state.n + 1 }, (_, k) => [`${k}!`, fact(k), k === state.n ? c.a : c.fillB, k === 0 ? '1 (= 1!/1)' : `${fact(k)} = ${k} × ${fact(k - 1)}`]), { max: fact(state.n), top: 10, gap: 6, left: 0.12 });
  },
  controls: [
    { title: 'Arrange n things' },
    { key: 'n', label: 'Number of things n', min: 0, max: 7, step: 1 },
    { readout: [
      ['n!', (s) => String(fact(s.n))],
      ['Arrangements of n', (s) => (s.n === 0 ? '1: the empty arrangement' : `${s.n} × ${fact(s.n - 1)}`)],
    ] },
  ],
  tex: (s) => `${s.n}!=${s.n === 0 ? '1' : Array.from({ length: s.n }, (_, i) => s.n - i).join('\\times')}=${fact(s.n)}`,
});
