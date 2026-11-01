import { createTool } from '../../lib/tool.js';
import { label, line, poly } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

// g(t) = (√(t² + 9) − 3) / t², whose limit as t → 0 is 1/6. A "calculator" keeps only `digits` significant digits at each step.
const state = { digits: 10 };
const TRUE = 1 / 6;
const keep = (x, d) => (x === 0 ? 0 : Number(x.toPrecision(d)));
const naive = (t, d) => keep(keep(Math.sqrt(keep(keep(t * t, d) + 9, d)), d) - 3, d) / keep(t * t, d);
const stable = (t) => 1 / (Math.sqrt(t * t + 9) + 3); // the same function after rationalising
const rows = Array.from({ length: 9 }, (_, i) => 10 ** -(i + 1));

createTool({
  state,
  label: 'A table of the values of the same function for smaller and smaller t, worked out by a calculator that keeps only a limited number of digits. The true limit is one sixth. The calculator\'s answers settle near one sixth for a while, then drift away and finally fall to 0, because the top of the fraction becomes the difference of two numbers that are equal to the number of digits kept.',
  draw(ctx, stage, c) {
    const top = 34;
    const rowH = (stage.h - top - 10) / rows.length;
    label(ctx, 't', 14, 18, c, { size: 11, align: 'left', bounds: stage, patch: false });
    label(ctx, 'calculator', stage.w * 0.5, 18, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'after rationalising', stage.w * 0.85, 18, c, { size: 11, bounds: stage, patch: false });
    rows.forEach((t, i) => {
      const y = top + i * rowH;
      const v = naive(t, state.digits);
      const off = Math.abs(v - TRUE) / TRUE;
      const w = Math.min(1, off) * stage.w * 0.2;
      poly(ctx, [[stage.w * 0.3, y + 2], [stage.w * 0.3 + w + 3, y + 2], [stage.w * 0.3 + w + 3, y + rowH - 2], [stage.w * 0.3, y + rowH - 2]], { fill: off < 0.01 ? c.fillC : c.fillA });
      label(ctx, `10^-${i + 1}`, 14, y + rowH / 2, c, { size: 11, align: 'left', bounds: stage, patch: false });
      label(ctx, sig(v, 6), stage.w * 0.5, y + rowH / 2, c, { size: 11, color: off < 0.01 ? c.ink : c.a, bounds: stage, patch: false });
      label(ctx, sig(stable(t), 6), stage.w * 0.85, y + rowH / 2, c, { size: 11, bounds: stage, patch: false });
    });
  },
  controls: [
    { title: 'How many digits does the calculator keep?' },
    { key: 'digits', label: 'Digits kept', min: 6, max: 16, step: 1 },
    { readout: [
      ['True limit', () => `1/6 = ${fixed(TRUE, 6)}`],
      ['Last row (t = 10⁻⁹)', (s) => ({ text: sig(naive(1e-9, s.digits), 4), good: Math.abs(naive(1e-9, s.digits) - TRUE) < 0.001 })],
    ] },
  ],
  tex: () => '\\dfrac{\\sqrt{t^2+9}-3}{t^2}=\\dfrac{1}{\\sqrt{t^2+9}+3}\\to\\dfrac16',
});
