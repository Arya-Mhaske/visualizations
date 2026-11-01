import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Rounded, approximate metro-area populations, to show the spread. Not exact census figures.
const CITIES = [['Delhi', 32e6], ['Mumbai', 21e6], ['Kolkata', 15e6], ['Bengaluru', 13e6], ['Pune', 7e6], ['Jaipur', 4e6], ['Shimla', 2e5], ['Ooty', 9e4], ['Leh', 3e4]];
const state = { log: false };
const LO = 4;
const HI = Math.log10(4e7);
const fraction = (v, log) => (log ? (Math.log10(v) - LO) / (HI - LO) : v / 32e6);
const shortNum = (v) => (v >= 1e6 ? `${v / 1e6}M` : v >= 1e3 ? `${v / 1e3}k` : `${v}`);
const barPx = (s, w, v) => fraction(v, s.log) * (w - 74 - 16);

createTool({
  state,
  label: 'Horizontal bars for the populations of nine Indian cities and towns, rounded. On a linear axis the large cities fill the chart and the small towns are hairlines. Switch to a log axis and every bar is long enough to read, because equal steps along the axis are equal multiples.',
  draw(ctx, stage, c) {
    const x0 = 74;
    const len = stage.w - x0 - 16;
    const rowH = (stage.h - 50) / CITIES.length;
    const ticks = state.log ? [1e4, 1e5, 1e6, 1e7] : [0, 1e7, 2e7, 3e7];
    for (const t of ticks) {
      const x = x0 + (t === 0 ? 0 : fraction(t, state.log)) * len;
      line(ctx, x, 12, x, stage.h - 32, { color: c.grid, width: 1 });
      label(ctx, t === 0 ? '0' : shortNum(t), x, stage.h - 18, c, { size: 10, bounds: stage, patch: false });
    }
    CITIES.forEach(([name, v], i) => {
      const y = 22 + i * rowH;
      const w = Math.max(2, fraction(v, state.log) * len);
      ctx.fillStyle = i < 6 ? c.fillA : c.fillB;
      ctx.fillRect(x0, y - rowH * 0.32, w, rowH * 0.64);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.strokeRect(x0, y - rowH * 0.32, w, rowH * 0.64);
      label(ctx, name, x0 - 6, y, c, { size: 10, align: 'right', patch: false });
    });
  },
  controls: [
    { title: 'Choose the axis' },
    { key: 'log', label: 'Log axis (each gridline is ×10)', toggle: true },
    { readout: [
      ['Leh bar length', (s) => `${fixed(Math.max(2, barPx(s, 360, 3e4)), 0)} px`],
      ['Delhi bar length', (s) => `${fixed(barPx(s, 360, 32e6), 0)} px`],
      ['Delhi ÷ Leh', () => `about ${fixed(32e6 / 3e4, 0)} times`],
    ] },
  ],
  tex: (s) => (s.log ? '\\text{axis position}\\ \\propto\\ \\log_{10}(\\text{population})' : '\\text{axis position}\\ \\propto\\ \\text{population}'),
});
