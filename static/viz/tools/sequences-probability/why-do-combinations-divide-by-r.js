import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { permutations, combos, nCr, nPr, fact } from './_counting.js';

const state = { n: 4, r: 2 };
const LET = ['A', 'B', 'C', 'D', 'E'];
let key = '';
let grid;
const rows = () => combos(LET.slice(0, state.n), state.r).map((cs) => permutations(cs));

createTool({
  state,
  label: 'A table with one row for each chosen set and one cell for each order that set can be written in.',
  dom: (el) => ({
    refresh() {
      const list = rows();
      const k = `${state.n}${state.r}`;
      if (k !== key) {
        el.textContent = '';
        grid = cellGrid(el, { rows: list.length, cols: fact(state.r), cell: (r, c) => ({ text: list[r][c], state: c === 0 ? 'on' : '' }) });
        key = k;
      }
      grid.refresh();
    },
  }),
  controls: [
    { title: 'Choose r of n' },
    { key: 'n', label: 'Letters n', min: 2, max: 5, step: 1 },
    { key: 'r', label: 'Chosen r', min: 1, max: 3, step: 1 },
    { readout: [
      ['Ordered ways P(n, r)', (s) => String(nPr(s.n, Math.min(s.r, s.n)))],
      ['Orders per set r!', (s) => String(fact(s.r))],
      ['Sets C(n, r)', (s) => String(nCr(s.n, s.r))],
    ] },
  ],
  tex: (s) => `C(${s.n},${s.r})=\\dfrac{P(${s.n},${s.r})}{${s.r}!}=\\dfrac{${nPr(s.n, Math.min(s.r, s.n))}}{${fact(s.r)}}=${nCr(s.n, s.r)}`,
  onChange: (s) => {
    s.r = Math.min(s.r, s.n);
  },
});
