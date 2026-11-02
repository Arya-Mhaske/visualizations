// Shared by the four-subspaces tools. No DOM.
import { nullBasis, rref, transpose } from './_la-math.js';

export const MATRICES = {
  rank2: { name: 'Rank 2', A: [[1, 2, 1, 3], [2, 4, 3, 7], [3, 6, 4, 10]] },
  rank3: { name: 'Rank 3', A: [[1, 2, 0, 1], [0, 1, 1, 0], [1, 0, 1, 1]] },
  rank1: { name: 'Rank 1', A: [[1, 2, 3, 4], [2, 4, 6, 8], [3, 6, 9, 12]] },
};

export function subspaces(A) {
  const { R, pivots } = rref(A);
  const r = pivots.length;
  return {
    R, pivots, r, m: A.length, n: A[0].length,
    free: A[0].map((_, j) => j).filter((j) => !pivots.includes(j)),
    column: pivots.map((j) => A.map((row) => row[j])),
    row: R.slice(0, r),
    null: nullBasis(A),
    left: nullBasis(transpose(A)),
  };
}
