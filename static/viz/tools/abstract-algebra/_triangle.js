// The six symmetries of an equilateral triangle, as moves of the three corner positions
// (0 top, 1 bottom-left, 2 bottom-right). MOVE[k][i] is where the corner sitting at position i goes.
import { compose } from './_aa-math.js';

export const NAMES = ['e', 'r', 'r²', 'f1', 'f2', 'f3'];
export const LONG = ['do nothing', 'turn 120° anticlockwise', 'turn 240° anticlockwise', 'flip about the axis through the top corner', 'flip about the axis through the bottom-left corner', 'flip about the axis through the bottom-right corner'];
export const MOVE = [[0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1], [2, 1, 0], [1, 0, 2]];
export const findMove = (p) => MOVE.findIndex((m) => m.every((v, i) => v === p[i]));
// THEN[x][y] is the symmetry you get by doing x first and then y.
export const THEN = MOVE.map((x) => MOVE.map((y) => findMove(compose(y, x))));
// arrangement[pos] = label at position pos. Doing a move carries each label to a new position.
export const apply = (arrangement, move) => {
  const out = [];
  arrangement.forEach((lab, pos) => { out[move[pos]] = lab; });
  return out;
};
