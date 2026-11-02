import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { nCr } from './_counting.js';

const state = { n: 5, r: 2 };
const N = 8;
let tool;

tool = createTool({
  state,
  label: 'Pascal triangle with one entry marked and the two entries directly above it highlighted.',
  dom: (el) => cellGrid(el, {
    rows: N + 1,
    cols: N + 1,
    cell: (r, c) => ({ text: c <= r ? String(nCr(r, c)) : '', state: r === state.n && c === state.r ? 'mark' : r === state.n - 1 && (c === state.r - 1 || c === state.r) ? 'on' : '', label: c <= r ? `Row ${r}, place ${c}` : '' }),
    onPress: (r, c) => {
      if (c <= r && r > 0) { state.n = r; state.r = c; tool.update(); }
    },
  }),
  controls: [
    { title: 'Pick an entry' },
    { key: 'n', label: 'Row n', min: 1, max: N, step: 1 },
    { key: 'r', label: 'Place r', min: 0, max: N, step: 1 },
    { readout: [
      ['Entry', (s) => String(nCr(s.n, s.r))],
      ['Parents', (s) => `${nCr(s.n - 1, s.r - 1)} + ${nCr(s.n - 1, s.r)}`],
      ['Sum of parents', (s) => String(nCr(s.n - 1, s.r - 1) + nCr(s.n - 1, s.r))],
      ['Last bracket gives', () => 'b: C(n−1, r−1) ways, or a: C(n−1, r) ways'],
    ] },
  ],
  tex: (s) => `C(${s.n},${s.r})=C(${s.n - 1},${s.r - 1})+C(${s.n - 1},${s.r})=${nCr(s.n, s.r)}`,
  onChange: (s) => {
    s.r = Math.min(s.r, s.n);
    tool?.ui.refresh();
  },
});
