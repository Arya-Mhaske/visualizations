import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { COMPLEX, probe } from './_rational-math.js';
import { stepsView } from './_steps-view.js';

const state = { i: 0, step: 1, x: 2.5 };
const cur = (s) => COMPLEX[s.i];
const show = (v) => (v === null ? 'undefined' : fixed(v, 4));
let view;
let tool;

tool = createTool({
  state,
  label: 'The worked steps for simplifying a complex fraction, revealed one at a time.',
  dom: (el) => {
    view = stepsView(el);
    return { refresh: () => view.show(cur(state).steps.map(([tex, note]) => ({ tex, note })), Math.min(state.step, cur(state).steps.length)) };
  },
  controls: [
    { title: 'Collapse the layers' },
    { key: 'i', label: 'Problem', options: COMPLEX.map((p, k) => [k, `${k + 1}`]) },
    { key: 'step', label: 'Steps shown', min: 1, max: 5, step: 1 },
    { key: 'x', label: 'Check at x', min: -4, max: 4, step: 0.5 },
    { readout: [
      ['Problem', (s) => cur(s).title],
      ['Original at x', (s) => show(probe(cur(s).f, s.x))],
      ['Answer at x', (s) => show(probe(cur(s).g, s.x))],
    ] },
  ],
  tex: (s) => cur(s).steps[Math.min(s.step, cur(s).steps.length) - 1][0],
  onChange: (s) => {
    s.step = Math.min(s.step, cur(s).steps.length);
    tool?.ui.refresh();
  },
});
