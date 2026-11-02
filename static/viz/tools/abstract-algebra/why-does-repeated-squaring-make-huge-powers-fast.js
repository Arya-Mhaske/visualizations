import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { squaring } from './_aa-math.js';
import { host, textBox } from './_aa-view.js';

// To find a^e mod m, square again and again (a, a², a⁴, a⁸, ...) and multiply together the squares that match the 1-bits of e.
const state = { a: 7, e: 1000, m: 13 };

createTool({
  state,
  label: 'A table with one row per binary digit of the exponent. Each row shows a to the power 2 to the i, reduced mod m, and whether that square is multiplied into the answer. Below it, the number of multiplications is compared with the naive count.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    const holder = host(el);
    const box = textBox(el);
    let grid = null;
    let rowsNow = -1;
    const refresh = () => {
      const out = squaring(state.a, state.e, state.m);
      if (rowsNow !== out.rows.length) {
        holder.replaceChildren();
        rowsNow = out.rows.length;
        grid = cellGrid(holder, {
          rows: rowsNow + 1, cols: 4,
          cell: (r, col) => {
            const now = squaring(state.a, state.e, state.m).rows;
            if (r === 0) return { text: ['i', '2^i', `a^(2^i) mod ${state.m}`, 'used?'][col], state: 'off' };
            const row = now[r - 1];
            return { text: [String(row.i), String(2 ** row.i), String(row.power), row.bit ? 'yes' : 'no'][col], state: row.bit ? 'on' : '' };
          },
        });
      }
      grid.refresh();
      const naive = state.e - 1;
      const used = out.squarings + out.multiplications - 1;
      box.set([`a^e mod m = ${out.result}.`, `Squarings: ${out.squarings}. Extra multiplications: ${Math.max(0, out.multiplications - 1)}. Total about ${used}, against ${naive} one at a time.`]);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Choose a power' },
    { key: 'a', label: 'Base, a', min: 2, max: 30, step: 1 },
    { key: 'e', label: 'Exponent, e', min: 2, max: 2000, step: 1 },
    { key: 'm', label: 'Modulus, m', min: 2, max: 60, step: 1 },
    { readout: [
      ['Bits in e', (s) => String(squaring(s.a, s.e, s.m).rows.length)],
      ['Answer', (s) => String(squaring(s.a, s.e, s.m).result)],
      ['Saving', (s) => `${s.e - 1} → ${squaring(s.a, s.e, s.m).squarings + Math.max(0, squaring(s.a, s.e, s.m).multiplications - 1)} products`],
    ] },
  ],
  tex: (s) => `${s.a}^{${s.e}}\\equiv ${squaring(s.a, s.e, s.m).result}\\pmod{${s.m}}`,
});
