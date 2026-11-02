import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';

const VARS = [['x', 'x (distance)'], ['v0', 'v₀'], ['v', 'v'], ['a', 'a'], ['t', 't']];
const EQS = [['v = v₀ + at', 'x'], ['x = v₀t + ½at²', 'v'], ['v² = v₀² + 2ax', 't'], ['x = ½(v₀ + v)t', 'a'], ['x = vt − ½at²', 'v0']];
const state = { find: 'x', skip: 'v' };
const use = (s) => (s.find === s.skip ? -1 : EQS.findIndex(([, miss]) => miss === s.skip));
const label = (k) => VARS.find(([key]) => key === k)[1];

createTool({
  state,
  label: 'A list of the five equations of motion. The one that leaves out the quantity you do not have is highlighted.',
  dom: (el) => cellGrid(el, {
    rows: 5,
    cols: 1,
    cell: (r) => ({ text: `${EQS[r][0]}   (no ${label(EQS[r][1])})`, state: r === use(state) ? 'on' : '', label: EQS[r][0] }),
  }),
  controls: [
    { title: 'What do you know?' },
    { key: 'find', label: 'I want to find', options: VARS },
    { key: 'skip', label: 'I do not have', options: VARS },
    { readout: [
      ['Use', (s) => (use(s) < 0 ? 'pick two different quantities' : EQS[use(s)][0])],
      ['It contains', (s) => (use(s) < 0 ? '—' : `${label(s.find)} and the three you know`)],
    ] },
  ],
});
