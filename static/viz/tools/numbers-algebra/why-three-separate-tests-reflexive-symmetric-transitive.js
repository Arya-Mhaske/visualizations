import { relationTool, toState } from './_sets-relation.js';

const PRESETS = [
  ['≤ (fails symmetric)', ['11', '22', '33', '12', '13', '23']],
  ['Fails transitive', ['11', '22', '33', '12', '21', '23', '32']],
  ['Fails reflexive', ['11', '22', '12', '21']],
];
const state = toState(PRESETS[0][1]);

relationTool(state, {
  label: 'Three numbered dots with arrows for each pair in the relation, and a loop for a pair like (1, 1).',
  title: 'Toggle the arrows',
  extra: (tool) => PRESETS.map(([name, pairs]) => ({
    button: name,
    ghost: true,
    onClick() {
      Object.assign(state, toState(pairs));
      tool.update();
    },
  })),
});
