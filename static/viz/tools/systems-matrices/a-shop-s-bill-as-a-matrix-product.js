import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { bmat, mul } from './_sm-math.js';
import { fixed } from '../../lib/format.js';

// Rows of Q are customers, columns are items (pens, notebooks, erasers). P is the price of each item. QP is every customer's bill at once.
const NAMES = ['Asha', 'Bilal', 'Chitra'];
const ITEMS = ['pens', 'books', 'erasers'];
const Q = [[3, 2, 1], [1, 4, 0], [2, 1, 5]];
const state = { p1: 10, p2: 25, p3: 5 };
const price = (s) => [[s.p1], [s.p2], [s.p3]];
const bills = (s) => mul(Q, price(s)).map((r) => r[0]);

createTool({
  state,
  label: 'A table of what three customers bought, three items by three customers, and a column of prices. Multiplying the table by the price column gives every customer bill at once, drawn as a bar for each customer. Changing a price changes the bars at once.',
  draw(ctx, stage, c) {
    const b = bills(state);
    const top = Math.max(...b, 1) * 1.2;
    const left = 70;
    const w = (stage.w - left - 20) / 3;
    b.forEach((v, i) => {
      const h = ((stage.h - 70) * v) / top;
      ctx.fillStyle = [c.fillA, c.fillB, c.fillY][i];
      ctx.fillRect(left + i * w + w * 0.15, stage.h - 40 - h, w * 0.7, h);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(left + i * w + w * 0.15, stage.h - 40 - h, w * 0.7, h);
      label(ctx, `₹${fixed(v, 0)}`, left + i * w + w / 2, stage.h - 48 - h, c, { size: 13, bounds: stage });
      label(ctx, NAMES[i], left + i * w + w / 2, stage.h - 20, c, { size: 12, bounds: stage });
    });
    label(ctx, 'bill', 28, 20, c, { size: 12 });
  },
  controls: [
    { title: 'Set the prices' },
    { key: 'p1', label: 'Price of a pen', min: 5, max: 30, step: 1, format: (n) => `₹${n}` },
    { key: 'p2', label: 'Price of a notebook', min: 10, max: 60, step: 1, format: (n) => `₹${n}` },
    { key: 'p3', label: 'Price of an eraser', min: 2, max: 20, step: 1, format: (n) => `₹${n}` },
    { readout: NAMES.map((n, i) => [`${n}: ${Q[i].map((q, k) => `${q} ${ITEMS[k].slice(0, 3)}`).join(', ')}`, (s) => ({ text: `₹${fixed(bills(s)[i], 0)}`, good: true })])
      .concat([['Total of all three bills', (s) => `₹${fixed(bills(s).reduce((a, v) => a + v, 0), 0)}`]]) },
  ],
  tex: (s) => `${bmat(Q, (v) => String(v))}${bmat(price(s), (v) => String(v))}=${bmat(bills(s).map((v) => [v]), (v) => String(v))}`,
});
