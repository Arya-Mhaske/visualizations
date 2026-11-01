import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { cells, relationCount, functionCount, isFunctionRelation, presetTicks } from './_what-is-a-function-math.js';

const state = { p: 3, q: 4, ticks: [[1, 2], [2, 3], [3, 4]] };
const has = (a, b) => state.ticks.some(([x, y]) => x === a && y === b);
const grouped = (n) => n.toLocaleString('en-IN');
let tool;

function dom(el) {
  let grid = null;
  let built = '';
  const build = () => {
    el.replaceChildren();
    built = `${state.p},${state.q}`;
    grid = cellGrid(el, {
      rows: state.p + 1,
      cols: state.q + 1,
      cell(r, c) {
        if (r === 0 && c === 0) return { text: 'A \\ B', state: 'off', label: 'Rows are A, columns are B' };
        if (r === 0) return { text: String(c), state: 'off', label: `b equals ${c}` };
        if (c === 0) return { text: String(r), state: 'off', label: `a equals ${r}` };
        return { text: has(r, c) ? '✓' : '', state: has(r, c) ? 'on' : '', label: `Pair (${r}, ${c}), ${has(r, c) ? 'ticked' : 'not ticked'}` };
      },
      onPress(r, c) {
        if (r === 0 || c === 0) return;
        state.ticks = has(r, c) ? state.ticks.filter(([x, y]) => !(x === r && y === c)) : [...state.ticks, [r, c]];
        tool.update();
      },
    });
  };
  build();
  return { refresh() { if (built !== `${state.p},${state.q}`) build(); else grid.refresh(); } };
}

tool = createTool({
  state,
  label: 'A grid of every pair in A times B, with one cell for each pair. Tick a cell to put that pair in the relation. A relation is any set of ticked cells, and it is a function when every row of A has exactly one tick.',
  dom,
  controls: [
    { title: 'Tick the pairs' },
    { key: 'p', label: 'Size of A', min: 2, max: 4, step: 1 },
    { key: 'q', label: 'Size of B', min: 2, max: 5, step: 1 },
    { row: [
      { button: 'a < b', ghost: true, onClick() { state.ticks = presetTicks('less', state.p, state.q); tool.update(); } },
      { button: 'b = 2a', ghost: true, onClick() { state.ticks = presetTicks('double', state.p, state.q); tool.update(); } },
      { button: 'Clear', ghost: true, onClick() { state.ticks = []; tool.update(); } },
    ] },
    { readout: [
      ['Cells in A × B', (s) => cells(s.p, s.q)],
      ['Pairs ticked', (s) => s.ticks.length],
      ['A function?', (s) => ({ text: isFunctionRelation(s.ticks, s.p) ? 'yes' : 'no', good: isFunctionRelation(s.ticks, s.p) })],
      ['All relations', (s) => grouped(relationCount(s.p, s.q))],
      ['Of those, functions', (s) => grouped(functionCount(s.p, s.q))],
    ] },
  ],
  tex: (s) => `|A\\times B|=${s.p}\\cdot ${s.q}=${cells(s.p, s.q)},\\quad 2^{${cells(s.p, s.q)}}=${grouped(relationCount(s.p, s.q))}\\text{ relations}`,
  onChange(s) {
    s.ticks = s.ticks.filter(([a, b]) => a <= s.p && b <= s.q);
  },
});
