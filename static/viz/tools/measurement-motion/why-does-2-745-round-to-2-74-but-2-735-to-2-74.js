import { createTool } from '../../lib/tool.js';
import { label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { roundEven, roundUp, tieError, tieThousandths, totalBias } from './_units-measurement-math.js';

const state = { digit: 4, rule: 'even' };
const text = (thousandths) => (thousandths / 1000).toFixed(3);
const hundredths = (value) => (value / 100).toFixed(2);
const signed = (x) => `${x > 0 ? '+' : ''}${fixed(x, 3)}`.replace('-', '−');

createTool({
  state,
  label: 'Ten numbers, each ending in exactly 5 in the third decimal place. Bars show how far each moves when rounded: all upward under round-half-up, alternating up and down under round-half-even.',
  draw(ctx, stage, c) {
    const pad = 18;
    const slot = (stage.w - 2 * pad) / 10;
    const mid = stage.h * 0.42;
    const unit = stage.h * 0.2 / 0.005; // pixels per unit of error
    line(ctx, pad, mid, stage.w - pad, mid, { color: c.ink, width: 2 });
    let running = 0;
    for (let d = 0; d < 10; d++) {
      const e = tieError(d, state.rule);
      running += e;
      const x = pad + d * slot + slot * 0.15;
      const h = e * unit;
      ctx.fillStyle = d === state.digit ? c.fillA : e > 0 ? c.fillB : c.fillC;
      ctx.fillRect(x, e > 0 ? mid - h : mid, slot * 0.7, Math.abs(h));
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = d === state.digit ? c.line : 1.5;
      ctx.strokeRect(x, e > 0 ? mid - h : mid, slot * 0.7, Math.abs(h));
      label(ctx, String(d), x + slot * 0.35, stage.h * 0.18, c, { size: 11, patch: false });
    }
    label(ctx, 'up: rounded up. down: rounded down.', stage.w / 2, stage.h * 0.04, c, { size: 10, bounds: stage });
    label(ctx, `one bar for each d in 2.7d5`, stage.w / 2, stage.h * 0.1, c, { size: 10, bounds: stage });
    label(ctx, `Total error of the ten: ${signed(running)}`, stage.w / 2, stage.h * 0.72, c, { size: 14, bounds: stage });
    label(ctx, `Mean error: ${signed(running / 10)} per number`, stage.w / 2, stage.h * 0.8, c, { size: 14, bounds: stage });
  },
  controls: [
    { title: 'Round exact halves' },
    { key: 'rule', label: 'Rule', options: [['up', 'Always up'], ['even', 'To even']] },
    { key: 'digit', label: 'Try the number 2.7d5, d =', min: 0, max: 9, step: 1 },
    { readout: [
      ['Number', (s) => text(tieThousandths(s.digit))],
      ['Always up', (s) => hundredths(roundUp(tieThousandths(s.digit)))],
      ['To even', (s) => hundredths(roundEven(tieThousandths(s.digit)))],
      ['Total error, always up', () => signed(totalBias('up'))],
      ['Total error, to even', () => signed(totalBias('even'))],
    ] },
  ],
  tex: (s) => `${text(tieThousandths(s.digit))} \\to ${hundredths(s.rule === 'even' ? roundEven(tieThousandths(s.digit)) : roundUp(tieThousandths(s.digit)))}`,
});
