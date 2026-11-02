import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { alternatingGroup, generated, orderOf, subgroupsBy2 } from './_aa-math.js';
import { host, textBox } from './_aa-view.js';

// A₄ has 12 elements. 6 divides 12, yet A₄ has no subgroup of order 6. Pick elements: the tool builds the subgroup they generate.
const G = alternatingGroup(4);
const picked = new Set([1]);
const ALL = subgroupsBy2(G);
const bySize = {};
ALL.forEach((H) => { bySize[H.length] = (bySize[H.length] || 0) + 1; });
const state = {};
const closure = () => generated(G, [...picked]);

const tool = createTool({
  state,
  label: 'The twelve even permutations of four things as pressable buttons. The panel shows the subgroup that the pressed ones generate, and a table of how many subgroups of each size exist. The size 6 has none.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    host(el, 'nb-label').textContent = 'Press elements. They generate a subgroup; its size appears below.';
    const grid = cellGrid(host(el), {
      rows: 3, cols: 4,
      cell: (r, c) => {
        const k = r * 4 + c;
        return { text: G.names[k] === '(1)' ? 'e' : G.names[k], state: picked.has(k) ? 'on' : closure().includes(k) ? 'mark' : '', label: `element of order ${orderOf(G, k)}` };
      },
      onPress: (r, c) => {
        const k = r * 4 + c;
        if (picked.has(k)) picked.delete(k); else picked.add(k);
        tool.update();
      },
    });
    const box = textBox(el);
    const refresh = () => {
      grid.refresh();
      const H = closure();
      box.set([`Pressed: ${picked.size}. They generate a subgroup of size ${H.length} (yellow cells are in it).`, H.length === 6 ? 'Six!' : `${H.length} divides 12.`, '6 divides 12 too, but no choice of elements ever gives 6.']);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Subgroups of A₄' },
    { text: 'Number of subgroups of A₄ found by trying every pair of elements:' },
    { readout: [1, 2, 3, 4, 6, 12].map((d) => [`Size ${d}`, () => ({ text: String(bySize[d] || 0), good: (bySize[d] || 0) > 0 })]) },
    { row: [{ button: 'Clear', ghost: true, onClick() { picked.clear(); tool.update(); } }] },
  ],
});
