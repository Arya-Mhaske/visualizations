// Three-variable systems [A | b] used by the row-reduction tools.
export const SYSTEMS = {
  unique: { name: 'One solution', M: [[1, 1, 1, 6], [0, 2, 5, -4], [2, 5, -1, 27]] },
  swap: { name: 'Needs a row swap', M: [[0, 2, 1, 7], [1, 1, 1, 6], [2, 1, 3, 13]] },
  none: { name: 'Inconsistent', M: [[1, 1, 1, 3], [1, 2, 3, 5], [2, 3, 4, 9]] },
  many: { name: 'Dependent', M: [[1, 1, 1, 3], [1, 2, 3, 5], [2, 3, 4, 8]] },
};
export const VARS = ['x', 'y', 'z'];

// One equation as the cells of a TeX array: the three terms (blank when the coefficient is 0) and the right side.
export function equationCells(row) {
  let first = true;
  const cells = VARS.map((v, i) => {
    const c = row[i];
    if (Math.abs(c) < 1e-12) return '';
    const mag = Math.abs(c) === 1 ? '' : String(Math.abs(c));
    const sign = c < 0 ? '-' : (first ? '' : '+');
    first = false;
    return `${sign}${mag}${v}`;
  });
  return [...cells, `=${row[3]}`];
}
export const equationsTex = (M) => `\\begin{array}{rrrl}${M.map((r) => equationCells(r).join('&')).join('\\\\')}\\end{array}`;
export const augTex = (M, fmt = (x) => String(x)) => `\\left[\\begin{array}{ccc|c}${M.map((r) => r.map(fmt).join('&')).join('\\\\')}\\end{array}\\right]`;
