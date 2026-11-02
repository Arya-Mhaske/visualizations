import { createTool } from '../../lib/tool.js';
import { stepsView } from './_steps-view.js';
import { GROUPS } from './_poly.js';

const state = { i: 0, step: 1, x: 2 };
const cur = (s) => GROUPS[s.i];
let view;
let tool;

tool = createTool({
  state,
  label: 'The worked steps of factoring by grouping, revealed one at a time, with a numeric check that the original and the factored forms agree.',
  dom: (el) => {
    view = stepsView(el);
    return { refresh: () => view.show(cur(state).steps.map((t, k) => ({ tex: t, note: cur(state).notes[k] })), Math.min(state.step, cur(state).steps.length)) };
  },
  controls: [
    { title: 'Group the terms' },
    { key: 'i', label: 'Problem', options: GROUPS.map((g, k) => [k, g.title]) },
    { key: 'step', label: 'Steps shown', min: 1, max: 5, step: 1 },
    { key: 'x', label: 'Check at x', min: -3, max: 4, step: 1 },
    { readout: [['Original at x', (s) => String(cur(s).f[0](s.x))], ['Factored at x', (s) => String(cur(s).f[1](s.x))], ['Agree?', (s) => ({ text: cur(s).f[0](s.x) === cur(s).f[1](s.x) ? 'yes' : 'no', good: true })]] },
  ],
  tex: (s) => cur(s).steps[Math.min(s.step, cur(s).steps.length) - 1],
  onChange: (s) => {
    s.step = Math.min(s.step, cur(s).steps.length);
    tool?.ui.refresh();
  },
});
