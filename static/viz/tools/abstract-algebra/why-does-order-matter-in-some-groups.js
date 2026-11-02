import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { NAMES, MOVE, THEN, apply } from './_triangle.js';
import { triPicture } from './_aa-view.js';

// Two moves, done in both orders on the same triangle. In the group of a triangle the results can differ.
const state = { x: 1, y: 3 };
const options = NAMES.map((n, i) => [i, n]);
const choose = (s) => [Number(s.x), Number(s.y)];

createTool({
  state,
  label: 'Two rows of three triangles. The top row does move x then move y to a labelled triangle. The bottom row does y then x. If the final triangles differ, order matters.',
  draw(ctx, stage, c) {
    const [x, y] = choose(state);
    const start = [0, 1, 2];
    const rows = [[x, y], [y, x]];
    const R = Math.min(stage.w / 8, stage.h / 7);
    rows.forEach(([first, second], r) => {
      const mid = apply(start, MOVE[first]);
      const end = apply(mid, MOVE[second]);
      const cy = stage.h * (r === 0 ? 0.26 : 0.7);
      [start, mid, end].forEach((arr, i) => {
        const cx = (stage.w * (2 * i + 1)) / 6;
        triPicture(ctx, c, cx, cy, R, arr, { title: ['start', `${NAMES[first]}`, `then ${NAMES[second]}`][i] });
      });
      label(ctx, `${NAMES[first]} then ${NAMES[second]}`, stage.w / 2, cy - R - 12, c, { size: 12, bounds: stage });
    });
    const same = THEN[x][y] === THEN[y][x];
    label(ctx, same ? 'Same result: these two moves commute' : 'Different results: order matters', stage.w / 2, stage.h - 12, c, { size: 13, color: same ? c.ink : c.a, bounds: stage });
  },
  controls: [
    { title: 'Pick two moves' },
    { key: 'x', label: 'First move', options },
    { key: 'y', label: 'Second move', options },
    { readout: [
      ['x then y', (s) => NAMES[THEN[Number(s.x)][Number(s.y)]]],
      ['y then x', (s) => NAMES[THEN[Number(s.y)][Number(s.x)]]],
      ['Same?', (s) => { const ok = THEN[Number(s.x)][Number(s.y)] === THEN[Number(s.y)][Number(s.x)]; return { text: ok ? 'yes' : 'no', good: ok }; }],
      ['Pairs that commute', () => `${THEN.flat().filter((v, i) => v === THEN[i % 6][Math.floor(i / 6)]).length} of 36`],
    ] },
  ],
  tex: (s) => `${NAMES[Number(s.x)]}\\ast ${NAMES[Number(s.y)]}=${NAMES[THEN[Number(s.x)][Number(s.y)]]},\\quad ${NAMES[Number(s.y)]}\\ast ${NAMES[Number(s.x)]}=${NAMES[THEN[Number(s.y)][Number(s.x)]]}`,
});
