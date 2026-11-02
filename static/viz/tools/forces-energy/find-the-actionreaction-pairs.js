import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';

const SCENES = {
  book: ['Book on a table', ['Earth pulls the book down', 'The table pushes the book up', 'The book pushes the table down', 'The book pulls the Earth up'], [3, 2, 1, 0]],
  walk: ['Person walking', ['The ground pushes the foot forward', 'The foot pushes the ground back', 'Earth pulls the person down', 'The person pulls Earth up'], [1, 0, 3, 2]],
  rocket: ['Rocket launch', ['The rocket pushes the gas down', 'The gas pushes the rocket up', 'Earth pulls the rocket down', 'The rocket pulls the Earth up'], [1, 0, 3, 2]],
};
const state = { scene: 'book', sel: 0 };
let tool;

tool = createTool({
  state,
  label: 'A list of the four forces in a scene. The chosen force is marked, and its action–reaction partner is highlighted.',
  dom: (el) => cellGrid(el, {
    rows: 4,
    cols: 1,
    cell: (r) => {
      const [, , pair] = SCENES[state.scene];
      return { text: SCENES[state.scene][1][r], state: r === state.sel ? 'mark' : r === pair[state.sel] ? 'on' : '', label: SCENES[state.scene][1][r] };
    },
    onPress: (r) => {
      state.sel = r;
      tool.update();
    },
  }),
  controls: [
    { title: 'Choose a scene' },
    { key: 'scene', label: 'Scene', options: Object.entries(SCENES).map(([k, v]) => [k, v[0]]) },
    { text: 'Press a force. The blue cell is your choice; the green cell is its partner.' },
    { readout: [
      ['You chose', (s) => SCENES[s.scene][1][s.sel]],
      ['Its pair', (s) => SCENES[s.scene][1][SCENES[s.scene][2][s.sel]]],
    ] },
  ],
  onChange: (s) => {
    s.sel = Math.min(s.sel, 3);
    tool?.ui.refresh();
  },
});
