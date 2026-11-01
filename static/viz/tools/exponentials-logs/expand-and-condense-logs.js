import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { e: 0, mode: 'expand', step: 1, x: 4, y: 9, z: 2 };
const ln = Math.log;
const l2 = Math.log2;
const l10 = Math.log10;
// Each line of an expression is written out and also computed independently, so the equal values are a real check.
const EXPRS = [
  { name: 'ln(x²y/z³)', lines: [
    ['ln(x²y / z³)', ({ x, y, z }) => ln((x * x * y) / z ** 3)],
    ['ln(x²y) − ln(z³)', ({ x, y, z }) => ln(x * x * y) - ln(z ** 3)],
    ['ln(x²) + ln y − ln(z³)', ({ x, y, z }) => ln(x * x) + ln(y) - ln(z ** 3)],
    ['2 ln x + ln y − 3 ln z', ({ x, y, z }) => 2 * ln(x) + ln(y) - 3 * ln(z)],
  ], rules: ['quotient rule', 'product rule', 'power rule'] },
  { name: 'log₂(√(xy)/z)', lines: [
    ['log₂( √(xy) / z )', ({ x, y, z }) => l2(Math.sqrt(x * y) / z)],
    ['log₂√(xy) − log₂ z', ({ x, y, z }) => l2(Math.sqrt(x * y)) - l2(z)],
    ['½ log₂(xy) − log₂ z', ({ x, y, z }) => 0.5 * l2(x * y) - l2(z)],
    ['½ log₂ x + ½ log₂ y − log₂ z', ({ x, y, z }) => 0.5 * l2(x) + 0.5 * l2(y) - l2(z)],
  ], rules: ['quotient rule', 'power rule (√ is a ½ power)', 'product rule'] },
  { name: 'log(10x²/y)', lines: [
    ['log( 10x² / y )', ({ x, y }) => l10((10 * x * x) / y)],
    ['log(10x²) − log y', ({ x, y }) => l10(10 * x * x) - l10(y)],
    ['log 10 + log(x²) − log y', ({ x, y }) => l10(10) + l10(x * x) - l10(y)],
    ['1 + 2 log x − log y', ({ x, y }) => 1 + 2 * l10(x) - l10(y)],
  ], rules: ['quotient rule', 'product rule', 'log 10 = 1 and the power rule'] },
];
const order = (s) => (s.mode === 'expand' ? [0, 1, 2, 3] : [3, 2, 1, 0]);

createTool({
  state,
  label: 'A logarithm expression written out line by line. Each line applies one log rule to the line above, and next to every line is its numeric value for the x, y and z you choose. The value never changes, which proves each step is legal. A switch runs the same steps backwards to condense.',
  draw(ctx, stage, c) {
    const E = EXPRS[state.e];
    const idx = order(state);
    for (let i = 0; i <= state.step; i++) {
      const [text, f] = E.lines[idx[i]];
      const y = 34 + i * 70;
      ctx.fillStyle = i === state.step ? c.fillY : c.fillB;
      ctx.fillRect(10, y - 22, stage.w - 20, 54);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(10, y - 22, stage.w - 20, 54);
      label(ctx, `${i ? '= ' : ''}${text}`, 18, y - 4, c, { size: 13, align: 'left', patch: false, bounds: stage });
      label(ctx, `value ${fixed(f(state), 6)}`, 18, y + 18, c, { size: 11, align: 'left', patch: false });
      if (i) {
        const rule = E.rules[state.mode === 'expand' ? i - 1 : 3 - i];
        label(ctx, rule, stage.w - 18, y + 18, c, { size: 10, align: 'right', patch: false, color: c.c });
      }
    }
  },
  controls: [
    { title: 'Apply the rules' },
    { key: 'e', label: 'Expression', options: [[0, 'ln(x²y/z³)'], [1, 'log₂'], [2, 'log 10x²/y']] },
    { key: 'mode', label: 'Direction', options: [['expand', 'Expand'], ['condense', 'Condense']] },
    { key: 'step', label: 'Steps applied', min: 0, max: 3, step: 1 },
    { key: 'x', label: 'x', min: 1, max: 20, step: 1 },
    { key: 'y', label: 'y', min: 1, max: 20, step: 1 },
    { key: 'z', label: 'z', min: 1, max: 20, step: 1 },
    { readout: [['Value on every line', (s) => ({ text: fixed(EXPRS[s.e].lines[0][1](s), 6), good: true })]] },
  ],
  tex: (s) => `x=${s.x},\\ y=${s.y},\\ z=${s.z}:\\quad \\text{every line}=${fixed(EXPRS[s.e].lines[0][1](s), 6)}`,
});
