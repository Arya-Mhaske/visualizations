import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { cyclicGroup, dihedralGroup, productGroup } from './_aa-math.js';
import { host, textBox } from './_aa-view.js';

// Fill a group's multiplication table. Row element first, then column element. The first row and column are given.
const GROUPS = {
  z4: { name: 'ℤ₄', G: cyclicGroup(4) },
  v4: { name: 'ℤ₂ × ℤ₂', G: productGroup(cyclicGroup(2), cyclicGroup(2)) },
  z5: { name: 'ℤ₅', G: cyclicGroup(5) },
  z6: { name: 'ℤ₆', G: cyclicGroup(6) },
  s3: { name: 'Triangle symmetries', G: dihedralGroup(3) },
};
const state = { group: 'z4', pen: 1 };
let fill = [];
let shown = '';

const G = () => GROUPS[state.group].G;
const pen = () => Math.min(Math.max(state.pen, 1), G().n - 1);
function reset() {
  const n = G().n;
  fill = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (__, c) => (r === 0 || c === 0 ? G().mul(r, c) : -1)));
  shown = state.group;
}
const conflicts = () => {
  const n = G().n;
  let k = 0;
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      if (fill[i][a] >= 0 && fill[i][a] === fill[i][b]) k++;
      if (fill[a][i] >= 0 && fill[a][i] === fill[b][i]) k++;
    }
  }
  return k;
};
const correct = () => fill.flat().filter((v, i) => v === G().mul(Math.floor(i / G().n), i % G().n)).length;

const tool = createTool({
  state,
  label: 'A multiplication table for a small group. The student picks an element in the panel and presses a cell to place it. Right entries turn green, wrong ones coral, and repeats in a row or column are counted.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    host(el, 'nb-label').textContent = 'Choose a pen element, then press a cell. Each element must appear once in every row and column.';
    const holder = host(el);
    let grid = null;
    const box = textBox(el);
    const build = () => {
      holder.replaceChildren();
      const n = G().n;
      grid = cellGrid(holder, {
        rows: n + 1, cols: n + 1,
        cell: (r, c) => {
          if (r === 0 && c === 0) return { text: '∘', state: 'off' };
          if (r === 0 || c === 0) return { text: G().names[(r === 0 ? c : r) - 1], state: 'off' };
          const v = fill[r - 1][c - 1];
          if (v < 0) return { text: '', state: '' };
          return { text: G().names[v], state: v === G().mul(r - 1, c - 1) ? 'on' : 'both', label: `${G().names[r - 1]} then ${G().names[c - 1]}` };
        },
        onPress: (r, c) => {
          if (r === 0 || c === 0 || r === 1 || c === 1) return;
          fill[r - 1][c - 1] = fill[r - 1][c - 1] === pen() ? -1 : pen();
          tool.update();
        },
      });
    };
    let built = '';
    const refresh = () => {
      if (shown !== state.group) reset();
      if (built !== state.group) { build(); built = state.group; }
      grid.refresh();
      const full = fill.flat().every((v) => v >= 0);
      box.set(full && correct() === G().n ** 2 ? ['The table is complete and every row and column holds each element once: a Latin square.'] : [`Pen: ${G().names[pen()]}. Entries placed: ${fill.flat().filter((v) => v >= 0).length - (2 * G().n - 1)}.`]);
    };
    reset();
    refresh();
    return { refresh };
  },
  controls: (t) => [
    { title: 'Choose a group' },
    { key: 'group', label: 'Group', options: Object.entries(GROUPS).map(([k, v]) => [k, v.name]) },
    { key: 'pen', label: 'Pen element', min: 1, max: 5, step: 1, format: () => G().names[pen()] },
    { row: [
      { button: 'Fill the rest', onClick() { const n = G().n; fill = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (__, c) => G().mul(r, c))); t.update(); } },
      { button: 'Clear', ghost: true, onClick() { reset(); t.update(); } },
    ] },
    { readout: [
      ['Correct cells', () => `${correct()} of ${G().n ** 2}`],
      ['Repeats in a row or column', () => ({ text: String(conflicts()), good: conflicts() === 0 })],
    ] },
  ],
});
