import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { label } from '../../lib/draw.js';
import { figure, host, textBox, triPicture } from './_aa-view.js';
import { LONG, MOVE, NAMES, THEN, apply } from './_triangle.js';

const state = { show: 'none', reveal: false };
const found = new Set(['1,3']);
let pick = [1, 3];
const key = (x, y) => `${x},${y}`;
const seen = (x, y) => state.reveal || found.has(key(x, y));

const tool = createTool({
  state,
  label: 'The six symmetries of a triangle listed along the top and left of a six by six table. Pressing a cell does the row move then the column move to a labelled triangle and fills in which symmetry results.',
  dom(el, c) {
    el.classList.add('viz-stage--flow');
    const pic = figure(el, c, (ctx, stage) => {
      const [x, y] = pick;
      const steps = [[0, 1, 2], apply([0, 1, 2], MOVE[x]), apply(apply([0, 1, 2], MOVE[x]), MOVE[y])];
      const titles = ['start', `after ${NAMES[x]}`, `then ${NAMES[y]}`];
      const R = Math.min(stage.w / 8, stage.h / 3.2);
      steps.forEach((arr, i) => {
        const cx = (stage.w * (2 * i + 1)) / 6;
        triPicture(ctx, c, cx, stage.h * 0.46, R, arr, { title: titles[i] });
      });
      label(ctx, `${NAMES[x]} then ${NAMES[y]} = ${NAMES[THEN[x][y]]}`, stage.w / 2, 14, c, { size: 13 });
    }, 'Three triangles in a row: the starting triangle, the triangle after the row move, and the triangle after the column move.', false);
    const grid = cellGrid(host(el), {
      rows: 7, cols: 7,
      cell: (r, col) => {
        if (r === 0 && col === 0) return { text: 'then', state: 'off' };
        if (r === 0 || col === 0) return { text: NAMES[(r === 0 ? col : r) - 1], state: 'off' };
        const [x, y] = [r - 1, col - 1];
        const result = THEN[x][y];
        let mark = '';
        if (seen(x, y)) mark = 'on';
        if (state.show === 'identity' && (x === 0 || y === 0)) mark = 'mark';
        if (state.show === 'inverses' && result === 0) mark = 'mark';
        if (state.show === 'order' && THEN[x][y] !== THEN[y][x]) mark = 'both';
        return { text: seen(x, y) || state.show !== 'none' ? NAMES[result] : '?', state: mark, label: `${NAMES[x]} then ${NAMES[y]}` };
      },
      onPress: (r, col) => {
        if (r === 0 || col === 0) return;
        pick = [r - 1, col - 1];
        found.add(key(r - 1, col - 1));
        tool.update();
      },
    });
    const box = textBox(el);
    const refresh = () => {
      grid.refresh();
      pic.invalidate();
      const [x, y] = pick;
      box.set([`${NAMES[x]}: ${LONG[x]}.   ${NAMES[y]}: ${LONG[y]}.`, `Doing ${NAMES[x]} then ${NAMES[y]} gives the same result as ${NAMES[THEN[x][y]]}, and ${NAMES[y]} then ${NAMES[x]} gives ${NAMES[THEN[y][x]]}.`]);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Fill the table' },
    { key: 'show', label: 'Highlight', options: [['none', 'None'], ['identity', 'Identity'], ['inverses', 'Inverses'], ['order', 'Order matters']] },
    { key: 'reveal', label: 'Show every entry', toggle: true },
    { readout: [
      ['Cells tried', () => `${found.size} of 36`],
      ['Closure', () => ({ text: THEN.flat().every((v) => v >= 0 && v < 6) ? 'every result is one of the six' : 'broken', good: true })],
      ['Cells where order matters', () => `${THEN.flat().filter((v, i) => v !== THEN[i % 6][Math.floor(i / 6)]).length} of 36`],
    ] },
  ],
});
void tool;
