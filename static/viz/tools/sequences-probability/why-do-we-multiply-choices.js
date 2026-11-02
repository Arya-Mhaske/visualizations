import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';

const state = { a: 2, b: 3, c: 2 };
const labels = (p, n) => Array.from({ length: n }, (_, i) => `${p}${i + 1}`);
const outfits = () => labels('S', state.a).flatMap((s) => labels('T', state.b).flatMap((t) => labels('H', state.c).map((h) => `${s}·${t}·${h}`)));
let grid;
let key = '';

createTool({
  state,
  label: 'Every outfit as a cell: each shirt is paired with each pair of trousers and each pair of shoes. The number of cells is the product of the three counts.',
  dom: (el) => ({
    refresh() {
      const list = outfits();
      const k = `${state.a}${state.b}${state.c}`;
      if (k !== key) {
        el.textContent = '';
        const cols = Math.min(state.b * state.c, 6);
        grid = cellGrid(el, { rows: Math.ceil(list.length / cols), cols, cell: (r, c) => ({ text: list[r * cols + c] ?? '', state: list[r * cols + c] ? (Math.floor((r * cols + c) / (state.b * state.c)) % 2 ? 'mark' : 'on') : '' }) });
        key = k;
      }
      grid.refresh();
    },
  }),
  controls: [
    { title: 'Choose an outfit' },
    { key: 'a', label: 'Shirts', min: 1, max: 4, step: 1 },
    { key: 'b', label: 'Trousers', min: 1, max: 3, step: 1 },
    { key: 'c', label: 'Shoes', min: 1, max: 3, step: 1 },
    { readout: [
      ['Outfits', (s) => `${s.a} × ${s.b} × ${s.c} = ${s.a * s.b * s.c}`],
      ['Cells shown', () => String(outfits().length)],
    ] },
  ],
  tex: (s) => `${s.a}\\times${s.b}\\times${s.c}=${s.a * s.b * s.c}`,
});
