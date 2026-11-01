import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const N = 7;
const state = { mode: 'percent', step: 20, pct: 25 };
const values = (s = state) => Array.from({ length: N }, (_, i) => (s.mode === 'add' ? 100 + s.step * i : 100 * (1 + s.pct / 100) ** i));
const diffs = (v) => v.slice(1).map((x, i) => x - v[i]);
const ratios = (v) => v.slice(1).map((x, i) => x / v[i]);
const allSame = (list) => list.every((x) => Math.abs(x - list[0]) < 1e-9 * Math.max(1, Math.abs(list[0])));
const money = (x) => (x >= 1000 ? fixed(x, 0) : x >= 100 ? fixed(x, 0) : fixed(x, 1));

createTool({
  state,
  label: 'Seven bars show a quantity starting at 100. Under each bar are two rows: the difference from the bar before and the ratio to the bar before. In add mode every difference is the same. In percent mode every ratio is the same.',
  draw(ctx, stage, c) {
    const v = values();
    const col = (stage.w - 20) / N;
    const base = stage.h * 0.5;
    const barMax = stage.h * 0.4;
    v.forEach((x, i) => {
      const h = Math.max(6, (x / v[N - 1]) * barMax);
      const left = 10 + col * i + 5;
      ctx.fillStyle = state.mode === 'add' ? c.fillB : c.fillA;
      ctx.fillRect(left, base - h, col - 10, h);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(left, base - h, col - 10, h);
      label(ctx, money(x), left + (col - 10) / 2, base - h - 11, c, { size: 10, bounds: stage });
    });
    const rows = [['Difference from the last bar', diffs(v).map((d) => `+${money(d)}`), allSame(diffs(v)), base + 20],
      ['Ratio to the last bar', ratios(v).map((r) => `×${fixed(r, 2)}`), allSame(ratios(v)), base + 64]];
    for (const [title, cells, same, y] of rows) {
      label(ctx, title, 10, y, c, { size: 11, align: 'left', patch: false });
      if (same) {
        ctx.strokeStyle = c.c;
        ctx.lineWidth = 3;
        ctx.strokeRect(10 + col - 2, y + 10, col * (N - 1) + 4, 28);
      }
      cells.forEach((text, i) => label(ctx, text, 10 + col * (i + 1) + col / 2, y + 24, c, { size: 10, bounds: stage, color: same ? c.c : c.ink }));
    }
  },
  controls: [
    { title: 'How does it change each step?' },
    { key: 'mode', label: 'Each step', options: [['add', 'Add the same amount'], ['percent', 'Grow by the same percent']] },
    { key: 'step', label: 'Amount added', min: 5, max: 50, step: 5 },
    { key: 'pct', label: 'Percent growth', min: 5, max: 100, step: 5, format: (v) => `${v}%` },
    { readout: [
      ['Differences', (s) => (allSame(diffs(values(s))) ? { text: 'all equal', good: true } : { text: 'keep growing', good: false })],
      ['Ratios', (s) => (allSame(ratios(values(s))) ? { text: 'all equal', good: true } : { text: 'keep changing', good: false })],
    ] },
  ],
  tex: (s) => (s.mode === 'add' ? `y_{n+1}=y_n+${s.step}` : `y_{n+1}=y_n\\times ${fixed(1 + s.pct / 100, 2)}\\ \\Rightarrow\\ y_n=100\\,(${fixed(1 + s.pct / 100, 2)})^n`),
});
