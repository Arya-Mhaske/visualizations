import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { nCr, fib } from './_counting.js';

const state = { view: 'rows', m: 5 };
const N = 8;
const diagSum = (m) => Array.from({ length: Math.floor(m / 2) + 1 }, (_, k) => nCr(m - k, k)).reduce((t, x) => t + x, 0);

createTool({
  state,
  label: 'Pascal triangle with either one row highlighted, whose numbers add to a power of two, or one slanting diagonal highlighted, whose numbers add to a Fibonacci number.',
  dom: (el) => cellGrid(el, {
    rows: N + 1,
    cols: N + 1,
    cell: (r, c) => ({ text: c <= r ? String(nCr(r, c)) : '', state: c <= r && (state.view === 'rows' ? r === state.m : r + c === state.m) ? 'on' : '' }),
  }),
  controls: [
    { title: 'Add along' },
    { key: 'view', label: 'Add along', options: [['rows', 'A row'], ['diag', 'A slanting diagonal']] },
    { key: 'm', label: 'Which one', min: 0, max: N, step: 1 },
    { readout: [
      ['Sum', (s) => (s.view === 'rows' ? `row ${s.m}: ${2 ** s.m} = 2^${s.m}` : `diagonal ${s.m}: ${diagSum(s.m)} = Fibonacci ${fib(s.m + 1)}`)],
      ['Row sums 0 to 8', () => Array.from({ length: 9 }, (_, r) => 2 ** r).join(', ')],
      ['Diagonal sums 0 to 8', () => Array.from({ length: 9 }, (_, m) => diagSum(m)).join(', ')],
    ] },
  ],
  tex: (s) => (s.view === 'rows' ? `\\sum_k\\binom{${s.m}}{k}=2^{${s.m}}` : `\\sum_k\\binom{${s.m}-k}{k}=F_{${s.m + 1}}=${fib(s.m + 1)}`),
});
