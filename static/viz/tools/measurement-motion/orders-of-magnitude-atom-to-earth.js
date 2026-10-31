import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { sci } from '../../lib/format.js';
import { OBJECTS, orderOf } from './_units-measurement-math.js';

const state = { a: 1, b: 7 };
const LOW = -16;
const HIGH = 22;
const size = (i) => OBJECTS[i][1];
const power = (n) => `10${String(n).replace(/[-0-9]/g, (ch) => ({ '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' })[ch])}`;
const gap = (s) => orderOf(size(s.b)) - orderOf(size(s.a));

createTool({
  state,
  label: 'A powers-of-ten ladder from 10 to the minus 16 metres to 10 to the 22 metres. Twelve objects sit on it at their sizes, and two chosen ones are joined by an arrow that counts the orders between them.',
  draw(ctx, stage, c) {
    const x = stage.w * 0.2;
    const top = 20;
    const bottom = stage.h - 16;
    const at = (exp) => bottom - ((exp - LOW) / (HIGH - LOW)) * (bottom - top);
    line(ctx, x, top, x, bottom, { color: c.ink, width: 3 });
    for (let p = LOW; p <= HIGH; p += 2) {
      line(ctx, x - 6, at(p), x + 6, at(p), { color: c.ink, width: 2 });
      label(ctx, power(p), x - 10, at(p), c, { align: 'right', size: 10, patch: false });
    }
    let lastY = -Infinity; // labels are pushed apart so crowded names stay readable; dots stay put
    [...OBJECTS.keys()].reverse().forEach((i) => {
      const [name, value] = OBJECTS[i];
      const chosen = i === state.a || i === state.b;
      const y = at(Math.log10(value));
      dot(ctx, x, y, chosen ? 8 : 5, i === state.a ? c.a : i === state.b ? c.b : c.paper, c.ink, chosen ? 3 : 2);
      const placed = Math.max(y, lastY + 13);
      lastY = placed;
      label(ctx, name, x + 14, placed, c, { align: 'left', bounds: stage, size: chosen ? 12 : 10 });
    });
    const ya = at(Math.log10(size(state.a)));
    const yb = at(Math.log10(size(state.b)));
    const bx = stage.w * 0.82;
    line(ctx, x + 10, ya, bx, ya, { color: c.a, width: 1, dash: [4, 4] });
    line(ctx, x + 10, yb, bx, yb, { color: c.b, width: 1, dash: [4, 4] });
    if (Math.abs(ya - yb) > 12) arrow(ctx, bx, ya, bx, yb, { color: c.ink, width: 3, head: 12 });
    label(ctx, `${Math.abs(gap(state))} orders`, bx - 6, (ya + yb) / 2, c, { align: 'right', bounds: stage, size: 13 });
  },
  controls: [
    { title: 'Place two objects on the ladder' },
    { key: 'a', label: 'Red object', min: 0, max: OBJECTS.length - 1, step: 1, format: (v) => OBJECTS[v][0] },
    { key: 'b', label: 'Blue object', min: 0, max: OBJECTS.length - 1, step: 1, format: (v) => OBJECTS[v][0] },
    { readout: [
      ['Size of red', (s) => `${sci(size(s.a), 2)} m`],
      ['Order of red', (s) => power(orderOf(size(s.a)))],
      ['Size of blue', (s) => `${sci(size(s.b), 2)} m`],
      ['Order of blue', (s) => power(orderOf(size(s.b)))],
      ['Orders apart', (s) => String(Math.abs(gap(s)))],
      ['Blue ÷ red, to the order', (s) => power(gap(s))],
    ] },
  ],
  tex: (s) => `\\frac{10^{${orderOf(size(s.b))}}}{10^{${orderOf(size(s.a))}}} = 10^{${gap(s)}}`,
});
