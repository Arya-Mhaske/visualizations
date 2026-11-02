// Shared by the Elimination and LU box. No DOM.
import { eliminate, identity, mul } from './_la-math.js';

export const PRESETS = {
  classic: { name: 'A fine matrix', A: [[2, 1, 1], [4, -6, 0], [-2, 7, 2]] },
  ladder: { name: 'Another fine one', A: [[1, 2, 1], [3, 8, 1], [0, 4, 1]] },
  tri: { name: 'Tridiagonal', A: [[2, 1, 0], [1, 2, 1], [0, 1, 2]] },
};
export const TROUBLE = {
  swap: { name: 'Zero pivot, fixable', A: [[0, 1, 1], [1, 2, 1], [2, 1, 3]] },
  singular: { name: 'Zero pivot, no rescue', A: [[1, 1, 1], [1, 2, 3], [1, 3, 5]] },
  fine: { name: 'No trouble', A: [[2, 1, 1], [4, -6, 0], [-2, 7, 2]] },
};

// L from the recorded multipliers (no row swaps): l_ij goes in row i, column j.
export function lowerFrom(mults, n) {
  const L = identity(n);
  for (const { row, col, l } of mults) L[row][col] = l;
  return L;
}
export const lu = (A) => { const e = eliminate(A, { allowSwap: false }); return { L: lowerFrom(e.mults, A.length), U: e.U, ...e }; };
export const product = (A, B) => mul(A, B);

// Elementary matrix that subtracts l × row j from row i.
export function elementary(n, i, j, l) {
  const E = identity(n);
  E[i][j] = -l;
  return E;
}

// Simulated arithmetic that keeps only `digits` significant figures after every operation.
export const fl = (x, digits) => (x === 0 ? 0 : Number(x.toPrecision(digits)));

// Solve [[eps, 1], [1, 1]] x = [1, 2] by elimination in `digits`-figure arithmetic.
export function tinyPivot(eps, digits, pivot) {
  const f = (x) => fl(x, digits);
  let x1;
  let x2;
  if (!pivot) {
    const m = f(1 / eps);
    const a22 = f(1 - f(m * 1));
    const b2 = f(2 - f(m * 1));
    x2 = f(b2 / a22);
    x1 = f(f(1 - x2) / eps);
  } else {
    const m = f(eps / 1);
    const a22 = f(1 - f(m * 1));
    const b2 = f(1 - f(m * 2));
    x2 = f(b2 / a22);
    x1 = f(2 - x2);
  }
  return [x1, x2];
}
// Exact solution (in doubles): x2 = (1 − 2ε)/(1 − ε), x1 = 2 − x2.
export const exactTiny = (eps) => { const x2 = (1 - 2 * eps) / (1 - eps); return [2 - x2, x2]; };
export function tinyError(eps, digits, pivot) {
  const got = tinyPivot(eps, digits, pivot);
  const ex = exactTiny(eps);
  return Math.max(...got.map((v, i) => Math.abs(v - ex[i]) / Math.abs(ex[i])));
}
