// Determinants from permutations and cofactors, for the Determinants box. No DOM.
import { det, solve, transpose } from './_la-math.js';

export const PERMS = [[0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1], [1, 0, 2], [2, 1, 0]];
export const sign = (p) => { let s = 1; for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) if (p[i] > p[j]) s = -s; return s; };
export const term = (A, p) => sign(p) * p.reduce((t, col, row) => t * A[row][col], 1);
export const bigFormula = (A) => PERMS.reduce((s, p) => s + term(A, p), 0);

export const minor = (A, i, j) => A.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
export const cofactor = (A, i, j) => ((i + j) % 2 ? -1 : 1) * det(minor(A, i, j));
export const cofactorMatrix = (A) => A.map((row, i) => row.map((_, j) => cofactor(A, i, j)));
export const adjugate = (A) => transpose(cofactorMatrix(A));
export const expandRow1 = (A) => A[0].reduce((s, v, j) => s + v * cofactor(A, 0, j), 0);

// A with column j replaced by b (for Cramer's rule).
export const replaceColumn = (A, j, b) => A.map((row, i) => row.map((v, c) => (c === j ? b[i] : v)));
export const cramer = (A, b) => { const D = det(A); return A.map((_, j) => det(replaceColumn(A, j, b)) / D); };
export const viaSolve = (A, b) => solve(A, b);

export const PRESETS = {
  a: { name: 'A 3 × 3', A: [[2, 1, 0], [1, 3, 1], [0, 1, 2]], b: [3, 5, 3] },
  b: { name: 'With a zero', A: [[1, 2, 3], [0, 4, 5], [1, 0, 6]], b: [6, 9, 7] },
  c: { name: 'Nearly singular', A: [[1, 2, 3], [4, 5, 6], [7, 8, 10]], b: [6, 15, 25] },
};
export const SMALL = { A: [[2, 1], [1, 3]], b: [3, 5] };
