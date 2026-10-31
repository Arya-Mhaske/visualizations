import { createTool } from '../../lib/tool.js';
import { count, countBoth, EVENTS, exclusive, independent } from './_conditional-probability-bayes-math.js';
import { diceGrid } from './_conditional-probability-bayes-draw.js';

const state = { a: 'first1', b: 'first6' };
const A = (s) => EVENTS[s.a][1];
const B = (s) => EVENTS[s.b][1];
const choices = Object.entries(EVENTS).map(([key, [name]]) => [key, name]);
const product = (s) => count(A(s)) * count(B(s));

createTool({
  state,
  label: 'All 36 outcomes of two dice, with event A, event B and any outcomes in both marked in different colours.',
  dom: (el) => diceGrid(el, (i, j) => {
    const [inA, inB] = [A(state)(i, j), B(state)(i, j)];
    if (inA && inB) return 'both';
    if (inA) return 'on';
    return inB ? 'mark' : '';
  }),
  controls: [
    { title: 'Exclusive or independent?' },
    { key: 'a', label: 'Event A (green)', options: choices },
    { key: 'b', label: 'Event B (yellow)', options: choices },
    { readout: [
      ['Overlap (red cells)', (s) => String(countBoth(A(s), B(s)))],
      ['P(A) × P(B)', (s) => `${product(s)}/1296`],
      ['P(A ∩ B)', (s) => `${countBoth(A(s), B(s)) * 36}/1296`],
      ['Mutually exclusive?', (s) => ({ text: exclusive(A(s), B(s)) ? 'yes' : 'no', good: exclusive(A(s), B(s)) })],
      ['Independent?', (s) => ({ text: independent(A(s), B(s)) ? 'yes' : 'no', good: independent(A(s), B(s)) })],
    ] },
  ],
  tex: (s) => `P(A \\cap B) = \\frac{${countBoth(A(s), B(s))}}{36} \\quad P(A)P(B) = \\frac{${count(A(s))}}{36} \\times \\frac{${count(B(s))}}{36}`,
});
