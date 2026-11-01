import { createTool } from '../../lib/tool.js';
import { label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { n: 2, places: 5 };
// Rough count of digit-by-digit multiplications in long division: (digits in the divisor) × (digits written in the answer)
const digits = (x) => String(x).replace('.', '').replace(/^0+/, '').length;
const ROOTS = { 2: 1.41421356, 3: 1.7320508, 5: 2.2360680, 6: 2.4494897, 7: 2.6457513 };
const approx = (s) => Number(ROOTS[s.n].toFixed(s.places));
const costA = (s) => digits(approx(s)) * (s.places + 1); // 1 ÷ 1.41421…
const costB = (s) => 1 * (s.places + 1); // 1.41421… ÷ 2: the divisor has one digit

createTool({
  state,
  label: 'Two ways of finding the decimal value of one over the square root of n. Dividing 1 by the long decimal for the root needs many digit-by-digit multiplications. Rationalising first gives the root of n over n, and dividing a decimal by a single whole number is far less work. The bars compare the work. Today a calculator does it either way, so rationalising is mostly a convention that makes answers easy to compare.',
  draw(ctx, stage, c) {
    const max = Math.max(costA(state), costB(state), 1);
    const bar = (v, y, fill, text) => {
      const w = (v / max) * stage.w * 0.7;
      poly(ctx, [[stage.w * 0.08, y], [stage.w * 0.08 + w, y], [stage.w * 0.08 + w, y + 36], [stage.w * 0.08, y + 36]], { fill, stroke: c.ink, width: 3 });
      label(ctx, `${v} multiplications`, stage.w * 0.08 + w + 6, y + 18, c, { size: 11, align: 'left', bounds: stage, patch: false });
      label(ctx, text, stage.w * 0.08, y - 12, c, { size: 11, align: 'left', bounds: stage, patch: false });
    };
    bar(costA(state), stage.h * 0.25, c.fillA, `1 ÷ ${approx(state)}`);
    bar(costB(state), stage.h * 0.62, c.fillC, `${approx(state)} ÷ ${state.n}`);
  },
  controls: [
    { title: 'Compare the work' },
    { key: 'n', label: 'n in 1/√n', options: [[2, '2'], [3, '3'], [5, '5'], [6, '6'], [7, '7']] },
    { key: 'places', label: 'Decimal places wanted', min: 2, max: 7, step: 1 },
    { readout: [
      ['1/√n', (s) => fixed(1 / Math.sqrt(s.n), s.places)],
      ['√n/n', (s) => fixed(Math.sqrt(s.n) / s.n, s.places)],
      ['Work saved', (s) => `${costA(s)} → ${costB(s)}`],
    ] },
  ],
  tex: (s) => `\\dfrac1{\\sqrt{${s.n}}}=\\dfrac{1}{\\sqrt{${s.n}}}\\cdot\\dfrac{\\sqrt{${s.n}}}{\\sqrt{${s.n}}}=\\dfrac{\\sqrt{${s.n}}}{${s.n}}`,
});
