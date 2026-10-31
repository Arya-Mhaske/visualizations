import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { PARTITIONS, partitionPairs } from './_sets-math.js';

const state = { pair: '12', picked: 1 };
const show = (blocks) => blocks.map((block) => `{${block.join(',')}}`).join(' ');
const holds = (blocks, s) => s.pair === 'none' || partitionPairs(blocks).includes(s.pair);
const matching = (s) => PARTITIONS.filter((blocks) => holds(blocks, s)).length;
let tool = null;

tool = createTool({
  state,
  label: 'The five ways to split 1, 2 and 3 into classes, each with the number of pairs it gives. Splits containing the chosen pair stay lit.',
  dom: (el) => cellGrid(el, {
    rows: PARTITIONS.length,
    cols: 2,
    cell(r, c) {
      const blocks = PARTITIONS[r];
      const lit = holds(blocks, state);
      return {
        text: c ? `${partitionPairs(blocks).length} pairs` : show(blocks),
        state: !lit ? 'off' : r === state.picked ? 'mark' : 'on',
        label: `${show(blocks)}, ${partitionPairs(blocks).length} pairs`,
      };
    },
    onPress(r) {
      state.picked = r;
      tool.update();
    },
  }),
  controls: [
    { title: 'Split, don\'t list' },
    { text: 'Every equivalence relation is a way of splitting the set into classes. Press a split to see its pairs.' },
    { key: 'pair', label: 'Must contain', options: [['none', 'Anything'], ['12', '(1, 2)'], ['13', '(1, 3)'], ['23', '(2, 3)']] },
    { readout: [
      ['Ways to split {1, 2, 3}', () => String(PARTITIONS.length)],
      ['Matching', (s) => String(matching(s))],
      ['This split gives', (s) => `${partitionPairs(PARTITIONS[s.picked]).length} pairs`],
    ] },
  ],
  tex: (s) => `R = \\{${partitionPairs(PARTITIONS[s.picked]).map((k) => `(${k[0]},${k[1]})`).join(',\\,')}\\}`,
});
