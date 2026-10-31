import { equivalenceClosure } from './_sets-math.js';
import { relationOf, relationTool, toState } from './_sets-relation.js';

const START = ['12', '23'];
const state = toState(START);
let added = [];
const needed = () => {
  const r = relationOf(state);
  return [...equivalenceClosure(r)].filter((k) => !r.has(k));
};

relationTool(state, {
  label: 'Three numbered dots with arrows for each pair in the relation. Pairs added to reach an equivalence relation show in coral.',
  title: 'Test, then repair',
  extra: (tool) => [
    { row: [
      { button: 'Add the fewest pairs', onClick() { added = needed(); Object.assign(state, toState([...relationOf(state), ...added])); tool.update(); } },
      { button: 'Start again', ghost: true, onClick() { added = []; Object.assign(state, toState(START)); tool.update(); } },
    ] },
  ],
  onDraw: () => added,
  rows: [
    ['Pairs in R', () => String(relationOf(state).size)],
    ['Pairs still needed', () => String(needed().length)],
    ['Equivalence relation?', () => ({ text: needed().length ? 'not yet' : 'yes', good: !needed().length })],
  ],
});
