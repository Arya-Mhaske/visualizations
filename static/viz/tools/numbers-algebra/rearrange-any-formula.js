import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { REARR } from './_linear-equations-math.js';
import { stepsView } from './_steps-view.js';

const state = { i: 0, step: 1 };
const cur = (s) => REARR[s.i];
let view;
let tool;

tool = createTool({
  state,
  label: 'The worked steps for rearranging the chosen formula, revealed one line at a time.',
  dom: (el) => {
    view = stepsView(el);
    return { refresh: () => view.show(cur(state).steps.map((tex, k) => ({ tex, note: cur(state).notes[k] })), Math.min(state.step, cur(state).steps.length)) };
  },
  controls: [
    { title: 'Choose a problem' },
    { key: 'i', label: 'Formula and target', options: REARR.map((r, k) => [k, `${r.target} from ${r.formula}`]) },
    { key: 'step', label: 'Steps shown', min: 1, max: 4, step: 1 },
    { readout: [
      ['Check with numbers', (s) => { const r = cur(s); const v = r.solve(r.base); return `${r.target} = ${fixed(v, 3)} (expected ${fixed(r.base[r.target], 3)})`; }],
      ['Agree?', (s) => { const r = cur(s); const ok = Math.abs(r.solve(r.base) - r.base[r.target]) < 1e-9; return { text: ok ? 'yes' : 'no', good: ok }; }],
    ] },
  ],
  tex: (s) => cur(s).steps[Math.min(s.step, cur(s).steps.length) - 1],
  onChange: (s) => {
    s.step = Math.min(s.step, cur(s).steps.length);
    tool?.ui.refresh();
  },
});
