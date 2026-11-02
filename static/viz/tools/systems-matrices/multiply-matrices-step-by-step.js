import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { mul } from './_sm-math.js';

const PAIRS = {
  a: { name: '2 × 3 times 3 × 2', A: [[1, 2, 0], [3, -1, 4]], B: [[2, 1], [0, 3], [5, -2]] },
  b: { name: '2 × 2 times 2 × 2', A: [[1, 2], [3, 4]], B: [[5, 6], [7, 8]] },
  c: { name: '3 × 2 times 2 × 3', A: [[1, 0], [2, 1], [0, 3]], B: [[1, 2, 3], [4, 5, 6]] },
};
const state = { which: 'a', i: 1, j: 1 };
const pair = (s) => PAIRS[s.which];
const clampIJ = (s) => { const C = mul(pair(s).A, pair(s).B); return [Math.min(s.i, C.length) - 1, Math.min(s.j, C[0].length) - 1]; };

// A grid of numbers with the chosen row and/or column highlighted
function grid(ctx, c, M, x0, y0, cell, { row = -1, col = -1, both = null, name }) {
  M.forEach((r, i) => r.forEach((v, j) => {
    const on = i === row || j === col;
    const hit = both && both[0] === i && both[1] === j;
    ctx.fillStyle = hit ? c.fillY : on ? (row >= 0 ? c.fillA : c.fillB) : c.paper;
    ctx.fillRect(x0 + j * cell, y0 + i * cell, cell, cell);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = hit ? 3 : 1.5;
    ctx.strokeRect(x0 + j * cell, y0 + i * cell, cell, cell);
    label(ctx, String(v), x0 + j * cell + cell / 2, y0 + i * cell + cell / 2, c, { size: Math.max(10, cell * 0.38), patch: false });
  }));
  label(ctx, name, x0 + (M[0].length * cell) / 2, y0 - 12, c, { size: 13 });
}

createTool({
  state,
  label: 'Three grids of numbers: A, B and their product AB. One row of A and one column of B are highlighted, and the matching entry of the product is highlighted too. That entry is found by multiplying the highlighted row and column pair by pair and adding.',
  draw(ctx, stage, c) {
    const { A, B } = pair(state);
    const C = mul(A, B);
    const [i, j] = clampIJ(state);
    const cols = A[0].length + B[0].length + C[0].length;
    const cell = Math.min((stage.w - 40) / (cols + 2), (stage.h - 60) / Math.max(A.length, B.length, C.length), 46);
    const y0 = Math.max(26, (stage.h - cell * Math.max(A.length, B.length)) / 2);
    const xa = 10;
    const xb = xa + A[0].length * cell + cell * 0.6;
    const xc = xb + B[0].length * cell + cell * 0.6;
    grid(ctx, c, A, xa, y0, cell, { row: i, name: 'A' });
    grid(ctx, c, B, xb, y0, cell, { col: j, name: 'B' });
    grid(ctx, c, C, xc, y0, cell, { both: [i, j], name: 'AB' });
  },
  controls: [
    { title: 'Pick one entry of AB' },
    { key: 'which', label: 'Matrices', options: Object.entries(PAIRS).map(([key, v]) => [key, v.name]) },
    { key: 'i', label: 'Row of the answer', min: 1, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'j', label: 'Column of the answer', min: 1, max: 3, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Row of A', (s) => pair(s).A[clampIJ(s)[0]].join(', ')],
      ['Column of B', (s) => pair(s).B.map((r) => r[clampIJ(s)[1]]).join(', ')],
      ['Products added', (s) => { const [i, j] = clampIJ(s); return pair(s).A[i].map((v, k) => `${v}×${pair(s).B[k][j]}`).join(' + '); }],
      ['The entry of AB', (s) => { const [i, j] = clampIJ(s); return { text: fixed(mul(pair(s).A, pair(s).B)[i][j], 0), good: true }; }],
    ] },
  ],
  tex: (s) => { const [i, j] = clampIJ(s); return `(AB)_{${i + 1}${j + 1}}=\\sum_k a_{${i + 1}k}\\,b_{k${j + 1}}=${fixed(mul(pair(s).A, pair(s).B)[i][j], 0)}`; },
});
