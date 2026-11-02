import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';

const PAIRS = [['x (displacement)', 'θ (angle)'], ['v (velocity)', 'ω (angular velocity)'], ['a (acceleration)', 'α (angular acceleration)'], ['m (mass)', 'I (moment of inertia)'], ['F (force)', 'τ (torque)'], ['p = mv', 'L = Iω'], ['F = ma', 'τ = Iα'], ['K = ½mv²', 'K = ½Iω²'], ['W = Fx', 'W = τθ'], ['P = Fv', 'P = τω']];
const state = { sel: 3 };
let tool;

tool = createTool({
  state,
  label: 'A two-column table pairing each linear quantity with its rotational twin. The chosen pair is highlighted.',
  dom: (el) => cellGrid(el, {
    rows: PAIRS.length,
    cols: 2,
    cell: (r, c) => ({ text: PAIRS[r][c], state: r === state.sel ? 'on' : '', label: PAIRS[r][c] }),
    onPress: (r) => {
      state.sel = r;
      tool.update();
    },
  }),
  controls: [
    { title: 'Pick a row' },
    { key: 'sel', label: 'Pair', min: 0, max: PAIRS.length - 1, step: 1, format: (v) => PAIRS[v][0] },
    { readout: [['Linear', (s) => PAIRS[s.sel][0]], ['Rotational twin', (s) => PAIRS[s.sel][1]]] },
  ],
  tex: () => `\\text{linear}\\ \\leftrightarrow\\ \\text{rotational}`,
});
