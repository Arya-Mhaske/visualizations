import { createTool } from '../../lib/tool.js';
import { count, countBoth, EVENTS } from './_conditional-probability-bayes-math.js';
import { diceGrid } from './_conditional-probability-bayes-draw.js';

const state = { a: 'sum7', b: 'firstEven', given: true };
const A = (s) => EVENTS[s.a][1];
const B = (s) => EVENTS[s.b][1];
const choices = Object.entries(EVENTS).map(([key, [name]]) => [key, name]);

createTool({
  state,
  label: 'All 36 outcomes of two dice. Outcomes outside B are greyed out, those in B stay, and those also in A are marked.',
  dom: (el) => diceGrid(el, (i, j) => {
    const [inA, inB] = [A(state)(i, j), B(state)(i, j)];
    if (state.given && !inB) return 'off';
    if (inA && inB) return 'both';
    if (inA) return 'on';
    return inB ? 'mark' : '';
  }),
  controls: [
    { title: 'Shrink the sample space' },
    { key: 'a', label: 'Event A', options: choices },
    { key: 'b', label: 'Given B', options: choices },
    { key: 'given', label: 'We know B happened', toggle: true },
    { readout: [
      ['Outcomes still possible', (s) => String(s.given ? count(B(s)) : 36)],
      ['Of those, in A', (s) => String(s.given ? countBoth(A(s), B(s)) : count(A(s)))],
      ['P(A)', (s) => `${count(A(s))}/36`],
      ['P(A ∩ B)', (s) => `${countBoth(A(s), B(s))}/36`],
      ['P(B)', (s) => `${count(B(s))}/36`],
      ['P(A | B)', (s) => `${countBoth(A(s), B(s))}/${count(B(s))}`],
    ] },
  ],
  tex: (s) => `P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{${countBoth(A(s), B(s))}/36}{${count(B(s))}/36} = \\frac{${countBoth(A(s), B(s))}}{${count(B(s))}}`,
});
