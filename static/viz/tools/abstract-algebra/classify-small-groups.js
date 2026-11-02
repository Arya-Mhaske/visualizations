import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { cyclicGroup, dihedralGroup, divisors, isAbelian, orderCounts, productGroup, quaternionGroup } from './_aa-math.js';
import { host, textBox } from './_aa-view.js';

// Every group of order up to 8. Two groups with different invariants (abelian or not, how many elements of each order)
// cannot be isomorphic, so a table of invariants sorts them.
const Z = cyclicGroup;
export const LIST = {
  1: [['trivial', Z(1)]],
  2: [['Z2', Z(2)]],
  3: [['Z3', Z(3)]],
  4: [['Z4', Z(4)], ['Z2×Z2', productGroup(Z(2), Z(2))]],
  5: [['Z5', Z(5)]],
  6: [['Z6', Z(6)], ['S3', dihedralGroup(3)]],
  7: [['Z7', Z(7)]],
  8: [['Z8', Z(8)], ['Z4×Z2', productGroup(Z(4), Z(2))], ['Z2×Z2×Z2', productGroup(productGroup(Z(2), Z(2)), Z(2))], ['D4', dihedralGroup(4)], ['Q8', quaternionGroup()]],
};
const state = { n: 8 };
const invariants = (G) => orderCounts(G);

const tool = createTool({
  state,
  label: 'A table with one row for each group of the chosen order. The columns say whether the group is abelian and how many elements it has of each possible order. Rows that differ cannot be the same group.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    const holder = host(el);
    const box = textBox(el);
    let grid = null;
    let built = 0;
    const refresh = () => {
      const groups = LIST[state.n];
      const ds = divisors(state.n);
      if (built !== state.n) {
        holder.replaceChildren();
        built = state.n;
        grid = cellGrid(holder, {
          rows: groups.length + 1, cols: 2 + ds.length,
          cell: (r, c) => {
            const list = LIST[state.n];
            const dd = divisors(state.n);
            if (r === 0) return { text: ['group', 'abelian', ...dd.map((d) => `ord ${d}`)][c], state: 'off' };
            const [name, G] = list[r - 1];
            if (c === 0) return { text: name, state: 'mark' };
            if (c === 1) return { text: isAbelian(G) ? 'yes' : 'no', state: '' };
            return { text: String(invariants(G)[dd[c - 2]] || 0), state: '' };
          },
        });
      }
      grid.refresh();
      const keys = groups.map(([, G]) => `${isAbelian(G)}|${JSON.stringify(invariants(G))}`);
      const distinct = new Set(keys).size === keys.length;
      box.set([`${groups.length} group${groups.length === 1 ? '' : 's'} of order ${state.n}, up to isomorphism.`, distinct ? 'Every row differs, so the invariants tell the groups apart.' : 'Two rows match: you need a finer invariant.']);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Choose an order' },
    { key: 'n', label: 'Order of the group', min: 1, max: 8, step: 1 },
    { readout: [
      ['Groups of this order', (s) => String(LIST[s.n].length)],
      ['Abelian ones', (s) => String(LIST[s.n].filter(([, G]) => isAbelian(G)).length)],
    ] },
  ],
  tex: (s) => `\\text{groups of order }${s.n}:\\ ${LIST[s.n].length}`,
});
void tool;
