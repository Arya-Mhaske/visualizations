// Pictures shared by the Bayes box: a 6 × 6 dice grid and a sample space cut into columns.
import { cellGrid } from '../../lib/discrete.js';
import { label, poly } from '../../lib/draw.js';

// states(i, j) -> a .viz-cell state ('', 'on', 'off', 'mark', 'both').
export function diceGrid(root, states) {
  return cellGrid(root, {
    rows: 7,
    cols: 7,
    cell(r, c) {
      if (r === 0 && c === 0) return { text: '' };
      if (r === 0 || c === 0) return { text: String(r || c) };
      return { text: `${r},${c}`, state: states(r, c), label: `First die ${r}, second die ${c}` };
    },
  });
}

// Column widths are the shares of the sample space; the shaded height is P(A | that column).
export function partitionBars(ctx, stage, c, { shares, rates, names, picked = -1, tag = 'A' }) {
  const [left, top] = [14, 30];
  const [w, h] = [stage.w - 28, stage.h - 80];
  const fills = [c.fillA, c.fillB, c.fillC];
  let x = left;
  shares.forEach((share, i) => {
    const width = share * w;
    const height = rates[i] * h;
    poly(ctx, [[x, top], [x + width, top], [x + width, top + h], [x, top + h]], { stroke: c.ink });
    poly(ctx, [[x, top + h - height], [x + width, top + h - height], [x + width, top + h], [x, top + h]], {
      fill: i === picked ? c.a : fills[i % 3], stroke: c.ink,
    });
    if (width > 18) label(ctx, names[i], x + width / 2, top - 14, c, { size: 12 });
    x += width;
  });
  label(ctx, `shaded: ${tag}`, stage.w / 2, stage.h - 26, c, { size: 12, bounds: stage });
}
