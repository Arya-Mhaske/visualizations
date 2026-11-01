import { createTool } from '../../lib/tool.js';
import { label, line, poly } from '../../lib/draw.js';

const state = { m: 6.02, e: 23, shift: 0 };
const PREFIX = { '-9': 'nano', '-6': 'micro', '-3': 'milli', 0: '', 3: 'kilo', 6: 'mega', 9: 'giga', 12: 'tera' };
const prefix = (e) => (e in PREFIX ? PREFIX[e] || 'none' : Object.keys(PREFIX).map(Number).includes(e - (e % 3)) && e % 3 === 0 ? PREFIX[e] : 'no common prefix');
const sup = (n) => String(n).replace(/-/g, '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
const plain = (m, e) => {
  if (e >= -6 && e <= 15) return Number((m * 10 ** e).toPrecision(6)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 12 });
  return `${m}×10${sup(e)}`;
};

createTool({
  state,
  label: 'A number written as a mantissa between 1 and 10 times a power of ten. The dial on the right slides the power of ten from minus 9, like nanoseconds, up to 100, a googol. Shifting the decimal point in the mantissa by k places must be balanced by the opposite change in the power, so the number stays the same, and the standard form is the one where the mantissa is between 1 and 10.',
  draw(ctx, stage, c) {
    const x0 = stage.w * 0.08;
    const x1 = stage.w * 0.92;
    const y = stage.h * 0.28;
    line(ctx, x0, y, x1, y, { color: c.ink, width: 3 });
    for (let e = -9; e <= 100; e += 1) {
      const x = x0 + ((e + 9) / 109) * (x1 - x0);
      line(ctx, x, y - (e % 10 === 0 ? 10 : 4), x, y + (e % 10 === 0 ? 10 : 4), { color: c.ink, width: 1 });
      if (e % 25 === 0 || e === -9) label(ctx, `10${sup(e)}`, x, y + 24, c, { size: 9, bounds: stage, patch: false });
    }
    const px = x0 + ((state.e + 9) / 109) * (x1 - x0);
    poly(ctx, [[px - 7, y - 24], [px + 7, y - 24], [px, y - 8]], { fill: c.a, stroke: c.ink, width: 2 });
    const mShift = state.m * 10 ** state.shift;
    const eShift = state.e - state.shift;
    label(ctx, `${state.m} × 10${sup(state.e)}`, stage.w / 2, stage.h * 0.55, c, { size: 20, bounds: stage });
    label(ctx, `= ${Number(mShift.toPrecision(8))} × 10${sup(eShift)}`, stage.w / 2, stage.h * 0.7, c, { size: 14, color: state.shift ? c.a : c.ink, bounds: stage });
    label(ctx, state.shift ? 'not standard form: the mantissa left 1 to 10' : 'standard form: 1 ≤ mantissa < 10', stage.w / 2, stage.h * 0.82, c, { size: 11, color: state.shift ? c.a : c.c, bounds: stage });
  },
  controls: [
    { title: 'Set the number' },
    { key: 'm', label: 'Mantissa', min: 1, max: 9.99, step: 0.01 },
    { key: 'e', label: 'Power of ten', min: -9, max: 100, step: 1 },
    { key: 'shift', label: 'Slide the decimal point by', min: -3, max: 3, step: 1 },
    { readout: [
      ['Value', (s) => plain(s.m, s.e)],
      ['Unit prefix', (s) => (s.e % 3 === 0 && s.e in PREFIX ? PREFIX[s.e] || 'none' : s.e === 100 ? 'a googol is 1 × 10¹⁰⁰' : 'not a standard prefix')],
    ] },
  ],
  tex: (s) => `${s.m}\\times10^{${s.e}}=${Number((s.m * 10 ** s.shift).toPrecision(8))}\\times10^{${s.e - s.shift}}`,
});
