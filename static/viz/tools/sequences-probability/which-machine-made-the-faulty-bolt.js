import { createTool } from '../../lib/tool.js';
import { fixed, frac } from '../../lib/format.js';
import { posterior, total } from './_conditional-probability-bayes-math.js';
import { partitionBars } from './_conditional-probability-bayes-draw.js';

const NAMES = ['A', 'B', 'C'];
const state = { a: 25, b: 35, pa: 5, pb: 4, pc: 2, machine: 1 };
const shares = (s) => [s.a / 100, s.b / 100, Math.max(0, 100 - s.a - s.b) / 100];
const rates = (s) => [s.pa / 100, s.pb / 100, s.pc / 100];
const stretched = (s) => rates(s).map((r) => r * 8);    // the shaded heights are drawn 8 times taller
const answer = (s) => posterior(shares(s), rates(s), s.machine);
const asFraction = (x) => {
  const found = frac(x, 500);
  return found ? `${found.p}/${found.q}` : fixed(x, 4);
};

createTool({
  state,
  label: 'Output of three machines as columns. The shaded part of each column is its defective bolts, and the chosen machine is highlighted.',
  draw: (ctx, stage, c) => partitionBars(ctx, stage, c, {
    shares: shares(state), rates: stretched(state), names: NAMES, picked: state.machine, tag: 'defective (drawn 8× taller)',
  }),
  controls: [
    { title: 'Trace a bad bolt back' },
    { key: 'machine', label: 'Blame machine', options: [[0, 'A'], [1, 'B'], [2, 'C']] },
    { key: 'a', label: 'A makes', min: 5, max: 60, step: 5, format: (v) => `${v}%` },
    { key: 'b', label: 'B makes', min: 5, max: 60, step: 5, format: (v) => `${v}%` },
    { key: 'pa', label: 'A defective', min: 1, max: 10, step: 1, format: (v) => `${v}%` },
    { key: 'pb', label: 'B defective', min: 1, max: 10, step: 1, format: (v) => `${v}%` },
    { key: 'pc', label: 'C defective', min: 1, max: 10, step: 1, format: (v) => `${v}%` },
    { readout: [
      ['C makes (the rest)', (s) => `${fixed(shares(s)[2] * 100, 0)}%`],
      ['Bolts defective overall', (s) => `${fixed(total(shares(s), rates(s)) * 100, 2)}%`],
      ['P(machine | defective)', (s) => `${asFraction(answer(s))} ≈ ${fixed(answer(s), 3)}`],
    ] },
  ],
  tex: (s) => `P(${NAMES[s.machine]} \\mid D) = \\frac{${fixed(shares(s)[s.machine], 2)} \\times ${fixed(rates(s)[s.machine], 2)}}{${fixed(total(shares(s), rates(s)), 4)}} = ${fixed(answer(s), 4)}`,
});
