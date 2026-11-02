import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { nCr } from './_counting.js';

const state = { n: 4, r: 2 };
const N = 8;
let tool;

tool = createTool({
  state,
  label: 'Pascal triangle as rows of numbers. The chosen number is marked, and the other numbers in its row are the coefficients of the same expansion.',
  dom: (el) => cellGrid(el, {
    rows: N + 1,
    cols: N + 1,
    cell: (r, c) => ({ text: c <= r ? String(nCr(r, c)) : '', state: r === state.n && c === state.r ? 'mark' : r === state.n && c <= r ? 'on' : '', label: c <= r ? `Row ${r}, place ${c}` : '' }),
    onPress: (r, c) => {
      if (c <= r) { state.n = r; state.r = c; tool.update(); }
    },
  }),
  controls: [
    { title: 'Pick a coefficient' },
    { key: 'n', label: 'Power n', min: 0, max: N, step: 1 },
    { key: 'r', label: 'Number of b brackets r', min: 0, max: N, step: 1 },
    { readout: [
      ['Coefficient C(n, r)', (s) => String(nCr(s.n, s.r))],
      ['Term', (s) => `${nCr(s.n, s.r)} a^${s.n - s.r} b^${s.r}`],
      ['Row n expands to', (s) => Array.from({ length: s.n + 1 }, (_, k) => `${nCr(s.n, k)}a^${s.n - k}b^${k}`).join(' + ')],
    ] },
  ],
  tex: (s) => `(a+b)^{${s.n}}\\ni\\ ${nCr(s.n, s.r)}\\,a^{${s.n - s.r}}b^{${s.r}}`,
  onChange: (s) => {
    s.r = Math.min(s.r, s.n);
    tool?.ui.refresh();
  },
});
