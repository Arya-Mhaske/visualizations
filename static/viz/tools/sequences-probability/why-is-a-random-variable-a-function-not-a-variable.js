import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';

// The sample space is the 36 outcomes (a, b). X is a rule that gives each outcome ONE number.
const RULES = {
  sum: ['X = sum', (a, b) => a + b],
  larger: ['X = larger', (a, b) => Math.max(a, b)],
  diff: ['X = |a − b|', (a, b) => Math.abs(a - b)],
};
const state = { a: 3, b: 4, rule: 'sum' };
const X = (s, a = s.a, b = s.b) => RULES[s.rule][1](a, b);
const countOf = (s, v) => { let n = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (X(s, a, b) === v) n++; return n; };

const tool = createTool({
  state,
  label: 'A six by six grid of the 36 outcomes of two dice, first die across and second die down. Each cell shows the value of the random variable for that outcome. The cell you chose has a thick border, and all cells with the same value as it are shaded. Under the grid, a bar for each possible value shows how many outcomes land on it.',
  draw(ctx, stage, c) {
    const cell = Math.min((stage.w - 40) / 6, (stage.h * 0.6) / 6);
    const x0 = (stage.w - cell * 6) / 2 + 8;
    const y0 = 22;
    const v = X(state);
    ctx.font = `700 ${Math.min(14, cell * 0.4)}px ${c.fontMono}`;
    for (let a = 1; a <= 6; a++) {
      label(ctx, String(a), x0 + (a - 0.5) * cell, y0 - 10, c, { size: 10, patch: false });
      label(ctx, String(a), x0 - 12, y0 + (a - 0.5) * cell, c, { size: 10, patch: false });
      for (let b = 1; b <= 6; b++) {
        const x = x0 + (a - 1) * cell;
        const y = y0 + (b - 1) * cell;
        const same = X(state, a, b) === v;
        ctx.fillStyle = same ? c.fillA : c.paper;
        ctx.fillRect(x, y, cell, cell);
        ctx.strokeStyle = c.grid;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cell, cell);
        label(ctx, String(X(state, a, b)), x + cell / 2, y + cell / 2, c, { size: Math.min(13, cell * 0.4), patch: false });
      }
    }
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 4;
    ctx.strokeRect(x0 + (state.a - 1) * cell, y0 + (state.b - 1) * cell, cell, cell);
    label(ctx, 'first die →', x0 + cell * 3, 8, c, { size: 9, patch: false });
    // bars: outcomes per value
    const values = [...new Set(Array.from({ length: 36 }, (_, i) => X(state, (i % 6) + 1, Math.floor(i / 6) + 1)))].sort((p, q) => p - q);
    const by = y0 + cell * 6 + 22;
    const bh = stage.h - by - 22;
    const bw = (stage.w - 40) / values.length;
    values.forEach((val, i) => {
      const n = countOf(state, val);
      const h = (bh * n) / 6;
      ctx.fillStyle = val === v ? c.a : c.fillB;
      ctx.fillRect(20 + i * bw + 2, by + bh - h, bw - 4, h);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.strokeRect(20 + i * bw + 2, by + bh - h, bw - 4, h);
      label(ctx, String(val), 20 + (i + 0.5) * bw, by + bh + 10, c, { size: 10, patch: false });
    });
    label(ctx, 'outcomes per value', stage.w / 2, by - 8, c, { size: 9, patch: false });
  },
  controls: () => [
    { title: 'Pick an outcome' },
    { key: 'a', label: 'First die', min: 1, max: 6, step: 1 },
    { key: 'b', label: 'Second die', min: 1, max: 6, step: 1 },
    { key: 'rule', label: 'The rule', options: Object.entries(RULES).map(([k, v]) => [k, v[0]]) },
    { readout: [
      ['Outcome', (s) => `(${s.a}, ${s.b})`],
      ['X of this outcome', (s) => `${X(s)}  (only one)`],
      ['Outcomes sharing it', (s) => `${countOf(s, X(s))} of 36`],
      ['P(X = value)', (s) => `${countOf(s, X(s))}/36`],
    ] },
  ],
  tex: (s) => `X(${s.a},${s.b})=${X(s)}\\qquad P(X=${X(s)})=\\dfrac{${countOf(s, X(s))}}{36}`,
});

tool.update();
