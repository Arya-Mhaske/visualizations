import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { T0, metalTau, metalN, semiN, semiTau, relR } from './_resistance-temperature-math.js';

const state = { T: 380 };
const SPAN = 2; // decades either side of "same as at 300 K"
const rows = (T) => [
  { name: 'Metal', items: [['collision time τ', metalTau(T), 'b'], ['carriers n', metalN(), 'c'], ['resistance R', relR(metalN(T), metalTau(T)), 'a']] },
  { name: 'Semiconductor', items: [['collision time τ', semiTau(T), 'b'], ['carriers n', semiN(T), 'c'], ['resistance R', relR(semiN(T), semiTau(T)), 'a']] },
];

const tool = createTool({
  state,
  label: 'Two groups of three bars on a log scale, one for a metal and one for a semiconductor. Bars show collision time, number of carriers and resistance compared with their values at 300 kelvin. A bar to the right of the middle line is bigger than at 300 kelvin, to the left is smaller.',
  draw(ctx, stage, c) {
    const mid = stage.w / 2;
    const half = stage.w / 2 - 14;
    const bandH = stage.h / 2;
    rows(state.T).forEach((group, g) => {
      const top = g * bandH;
      label(ctx, group.name, mid, top + 20, c, { color: c.ink, size: 14 });
      group.items.forEach(([name, value, key], i) => {
        const y = top + 38 + i * ((bandH - 54) / 3);
        const h = (bandH - 54) / 3 - 14;
        const x = mid + (Math.log10(value) / SPAN) * half;
        const lo = Math.max(14, Math.min(x, mid));
        const hi = Math.min(stage.w - 14, Math.max(x, mid));
        ctx.fillStyle = c[key];
        ctx.fillRect(lo, y, Math.max(hi - lo, 3), h);
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 3;
        ctx.strokeRect(lo, y, Math.max(hi - lo, 3), h);
        label(ctx, `${name}: × ${sig(value, 2)}`, mid, y + h / 2, c, { color: c.ink, size: 11 });
      });
    });
    line(ctx, mid, 4, mid, stage.h - 4, { color: c.ink, width: 3, dash: [6, 5] });
  },
  controls: () => [
    { title: 'Heat or cool the sample' },
    { key: 'T', label: 'Temperature, T', min: 250, max: 400, step: 5, format: (n) => `${n} K` },
    { readout: [
      ['Metal R', (s) => `× ${sig(relR(metalN(s.T), metalTau(s.T)), 3)}`],
      ['Semiconductor R', (s) => `× ${sig(relR(semiN(s.T), semiTau(s.T)), 3)}`],
      ['Carriers, semiconductor', (s) => `× ${sig(semiN(s.T), 3)}`],
    ] },
  ],
  tex: (s) => `R\\propto\\dfrac{1}{n\\,\\tau}\\qquad \\text{at }${s.T}\\ \\text{K}`,
});
tool.update();
