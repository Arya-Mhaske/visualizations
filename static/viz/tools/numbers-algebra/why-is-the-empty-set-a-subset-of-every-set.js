import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { isSubset, outside } from './_sets-math.js';

const UNIVERSE = [1, 2, 3, 4, 5, 6];
const SETS = { low: [1, 2, 3], even: [2, 4, 6], none: [] };
const state = { a: 'low', chosen: [2, 5] };
const A = (s) => SETS[s.a];
const show = (list) => (list.length ? `{${list.join(', ')}}` : '∅');
const witnesses = (s) => outside(s.chosen, A(s));
let tool = null;

tool = createTool({
  state,
  label: 'Six number buttons. Pressed numbers form the set B. A number in B but outside A turns red, and that is what would break B being a subset of A.',
  dom: (el) => cellGrid(el, {
    rows: 1,
    cols: 6,
    cell(r, c) {
      const x = UNIVERSE[c];
      const inB = state.chosen.includes(x);
      const inA = A(state).includes(x);
      return { text: String(x), state: !inB ? (inA ? 'mark' : '') : inA ? 'on' : 'both', label: `${x}${inB ? ', in B' : ''}${inA ? ', in A' : ''}` };
    },
    onPress(r, c) {
      const x = UNIVERSE[c];
      state.chosen = state.chosen.includes(x) ? state.chosen.filter((v) => v !== x) : [...state.chosen, x].sort();
      tool.update();
    },
  }),
  controls: [
    { title: 'Hunt for a rule-breaker' },
    { text: 'Yellow is A. Press numbers to build B: green is in both, red is in B but outside A.' },
    { key: 'a', label: 'Set A', options: [['low', '{1, 2, 3}'], ['even', '{2, 4, 6}'], ['none', '∅']] },
    { row: [{ button: 'Empty B', ghost: true, onClick() { state.chosen = []; tool.update(); } }] },
    { readout: [
      ['B', (s) => show(s.chosen)],
      ['A', (s) => show(A(s))],
      ['Elements of B outside A', (s) => show(witnesses(s))],
      ['B ⊂ A?', (s) => ({ text: isSubset(s.chosen, A(s)) ? 'yes: no rule-breaker' : 'no', good: isSubset(s.chosen, A(s)) })],
    ] },
  ],
  tex: (s) => `B = ${show(s.chosen).replace('∅', '\\emptyset').replace(/[{}]/g, (m) => `\\${m}`)},\\quad \\text{outside } A: ${witnesses(s).length}\\ \\text{elements}`,
});
