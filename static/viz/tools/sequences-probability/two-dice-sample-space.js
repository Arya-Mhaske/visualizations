import { createTool } from '../../lib/tool.js';
import { EVENTS, count, countBoth } from './_conditional-probability-bayes-math.js';
import { diceGrid } from './_conditional-probability-bayes-draw.js';

const state = { a: 'sum7', b: 'first6' };
const A = (s) => EVENTS[s.a][1];
const B = (s) => EVENTS[s.b][1];
const choices = Object.entries(EVENTS).map(([k, v]) => [k, v[0]]);
const orCount = (s) => count((i, j) => A(s)(i, j) || B(s)(i, j));

createTool({
  state,
  label: 'The 6 by 6 grid of two-dice outcomes. Cells in event A, event B, and both are coloured differently.',
  dom: (el) => diceGrid(el, (i, j) => {
    const [x, y] = [A(state)(i, j), B(state)(i, j)];
    return x && y ? 'both' : x ? 'on' : y ? 'mark' : '';
  }),
  controls: [
    { title: 'Colour two events' },
    { key: 'a', label: 'Event A', options: choices },
    { key: 'b', label: 'Event B', options: choices },
    { readout: [
      ['P(A)', (s) => `${count(A(s))}/36`],
      ['P(B)', (s) => `${count(B(s))}/36`],
      ['P(A and B)', (s) => `${countBoth(A(s), B(s))}/36`],
      ['P(A or B)', (s) => `${orCount(s)}/36`],
    ] },
  ],
  tex: (s) => `P(A\\cup B)=\\dfrac{${count(A(s))}+${count(B(s))}-${countBoth(A(s), B(s))}}{36}=\\dfrac{${orCount(s)}}{36}`,
});
