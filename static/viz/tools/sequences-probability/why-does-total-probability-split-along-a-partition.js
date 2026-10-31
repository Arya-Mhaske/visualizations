import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { total } from './_conditional-probability-bayes-math.js';
import { partitionBars } from './_conditional-probability-bayes-draw.js';

const state = { e1: 0.5, e2: 0.3, a1: 0.2, a2: 0.6, a3: 0.4 };
const shares = (s) => {
  const first = s.e1;
  const second = Math.min(s.e2, 1 - first);
  return [first, second, Math.max(0, 1 - first - second)];
};
const rates = (s) => [s.a1, s.a2, s.a3];
const pct = (v) => fixed(v, 2);

createTool({
  state,
  label: 'The sample space drawn as a square, cut into three columns E1, E2 and E3. In each column the shaded height is the chance of A, so the shaded areas add to P(A).',
  draw: (ctx, stage, c) => partitionBars(ctx, stage, c, { shares: shares(state), rates: rates(state), names: ['E₁', 'E₂', 'E₃'] }),
  controls: [
    { title: 'Cut, then add the slices' },
    { key: 'e1', label: 'P(E₁)', min: 0.1, max: 0.8, step: 0.05, format: pct },
    { key: 'e2', label: 'P(E₂)', min: 0.05, max: 0.8, step: 0.05, format: pct },
    { key: 'a1', label: 'P(A | E₁)', min: 0, max: 1, step: 0.05, format: pct },
    { key: 'a2', label: 'P(A | E₂)', min: 0, max: 1, step: 0.05, format: pct },
    { key: 'a3', label: 'P(A | E₃)', min: 0, max: 1, step: 0.05, format: pct },
    { readout: [
      ['P(E₃), the rest', (s) => pct(shares(s)[2])],
      ['Slice in E₁', (s) => fixed(shares(s)[0] * s.a1, 3)],
      ['Slice in E₂', (s) => fixed(shares(s)[1] * s.a2, 3)],
      ['Slice in E₃', (s) => fixed(shares(s)[2] * s.a3, 3)],
      ['P(A)', (s) => fixed(total(shares(s), rates(s)), 3)],
    ] },
  ],
  tex: (s) => `P(A) = \\sum P(E_i)P(A \\mid E_i) = ${shares(s).map((p, i) => `${pct(p)} \\times ${pct(rates(s)[i])}`).join(' + ')} = ${fixed(total(shares(s), rates(s)), 3)}`,
});
