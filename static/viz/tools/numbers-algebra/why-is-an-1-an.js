import { createTool } from '../../lib/tool.js';
import { drawLadder } from './_exponents-view.js';

const state = { base: 2, shown: -2 };

createTool({
  state,
  label: 'The same ladder of powers, now carried on past exponent 0. Each step down still divides by the base, so the values become one over the base, one over the base squared, and so on. The pattern forces the negative power a to the minus n to equal one over a to the n.',
  draw: (ctx, stage, c) => drawLadder(ctx, stage, c, state.base, 3, -4, state.shown),
  controls: [
    { title: 'Keep walking down' },
    { key: 'base', label: 'Base, a', min: 2, max: 6, step: 1 },
    { key: 'shown', label: 'Walk down to exponent', min: -4, max: 3, step: 1 },
    { readout: [
      ['Value there', (s) => (s.shown >= 0 ? `${s.base ** s.shown}` : `1/${s.base ** -s.shown}`)],
      ['As a decimal', (s) => String(Number((s.base ** s.shown).toPrecision(6)))],
    ] },
  ],
  tex: (s) => `${s.base}^{${s.shown}}=${s.shown >= 0 ? s.base ** s.shown : `\\dfrac{1}{${s.base}^{${-s.shown}}}=\\dfrac1{${s.base ** -s.shown}}`}`,
});
