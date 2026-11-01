// Maths for the cells-emf-power box.
export const current = (E, r, R) => E / (R + r);
export const terminal = (E, r, I) => E - I * r;
export const loadPower = (E, r, R) => current(E, r, R) ** 2 * R;
export const lostInside = (E, r, R) => current(E, r, R) ** 2 * r;
// Cell power to the load is biggest when R = r.
export const bestLoad = (r) => r;

// Line loss: send P along a line of resistance Rline at voltage V.
export const lineCurrent = (P, V) => P / V;
export const lineLoss = (P, V, Rline) => lineCurrent(P, V) ** 2 * Rline;

// Cells joined: n identical cells (E, r) in series, m in parallel groups.
export function combine(cells, mode) {
  if (mode === 'series') return { E: cells.reduce((s, c) => s + c.E, 0), r: cells.reduce((s, c) => s + c.r, 0) };
  // parallel: each cell is a branch E_i with r_i, so use the weighted result
  const g = cells.reduce((s, c) => s + 1 / c.r, 0);
  const E = cells.reduce((s, c) => s + c.E / c.r, 0) / g;
  return { E, r: 1 / g };
}
