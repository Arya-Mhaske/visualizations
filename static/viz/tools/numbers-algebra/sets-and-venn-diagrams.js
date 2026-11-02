import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';

// status: 0 neither, 1 A only, 2 B only, 3 both
const mem = Array.from({ length: 12 }, (_, i) => (i < 4 ? 1 : i < 6 ? 3 : i < 8 ? 2 : 0));
const state = { op: 'union' };
let tool;
const inA = (i) => mem[i] === 1 || mem[i] === 3;
const inB = (i) => mem[i] === 2 || mem[i] === 3;
const OPS = {
  union: ['A ∪ B', (i) => inA(i) || inB(i)],
  inter: ['A ∩ B', (i) => inA(i) && inB(i)],
  compA: ['A′', (i) => !inA(i)],
  diff: ['A − B', (i) => inA(i) && !inB(i)],
};
const list = (test) => mem.map((_, i) => i).filter(test).map((i) => i + 1);
const show = (a) => `{${a.join(', ')}}`;

tool = createTool({
  state,
  label: 'Twelve numbered cells, each in A, in B, in both or in neither. Cells kept by the chosen operation are ticked.',
  dom: (el) => cellGrid(el, {
    rows: 3,
    cols: 4,
    cell: (r, c) => {
      const i = r * 4 + c;
      const kept = OPS[state.op][1](i);
      return { text: `${i + 1}${kept ? ' ✓' : ''}`, state: ['', 'on', 'mark', 'both'][mem[i]], label: `Number ${i + 1}` };
    },
    onPress: (r, c) => {
      const i = r * 4 + c;
      mem[i] = (mem[i] + 1) % 4;
      tool.update();
    },
  }),
  controls: [
    { title: 'Operation' },
    { key: 'op', label: 'Show', options: Object.entries(OPS).map(([k, v]) => [k, v[0]]) },
    { text: 'The cell colour shows A only, B only or both; a plain cell is in neither.' },
    { readout: [
      ['A', () => show(list(inA))],
      ['B', () => show(list(inB))],
      ['Result', (s) => show(list(OPS[s.op][1]))],
      ['n(A) + n(B) − n(A ∩ B)', () => `${list(inA).length} + ${list(inB).length} − ${list((i) => inA(i) && inB(i)).length} = ${list((i) => inA(i) || inB(i)).length}`],
    ] },
  ],
  tex: (s) => `${OPS[s.op][0].replace('∪', '\\cup').replace('∩', '\\cap').replace('′', "'")}=${show(list(OPS[s.op][1])).replace('{', '\\{').replace('}', '\\}')}`,
});
