import { createTool } from '../../lib/tool.js';
import { drawLadder } from './_exponents-view.js';

const state = { base: 2, shown: 3 };

createTool({
  state,
  label: 'A ladder of powers of a number, starting at the third power and going down. Each step down divides the previous value by the base. Keep going until the exponent reaches 0. The pattern of dividing by the base each time forces the value at exponent 0 to be 1.',
  draw: (ctx, stage, c) => drawLadder(ctx, stage, c, state.base, 4, 0, state.shown),
  controls: [
    { title: 'Walk down the ladder' },
    { key: 'base', label: 'Base, a', min: 2, max: 9, step: 1 },
    { key: 'shown', label: 'Walk down to exponent', min: 0, max: 4, step: 1, format: (v) => `${v}` },
    { readout: [
      ['Last step', (s) => `${s.base ** (s.shown + 1)} ÷ ${s.base} = ${s.base ** s.shown}`],
      ['Value at exponent 0', (s) => ({ text: s.shown === 0 ? '1' : 'keep going', good: s.shown === 0 })],
    ] },
  ],
  tex: (s) => `${s.base}^{${s.shown + 1}}\\div ${s.base}=${s.base}^{${s.shown}}=${s.base ** s.shown}`,
});
