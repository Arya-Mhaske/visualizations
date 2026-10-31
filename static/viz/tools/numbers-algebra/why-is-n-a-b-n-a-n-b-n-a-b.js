import { createTool } from '../../lib/tool.js';
import { venn } from '../../lib/discrete.js';
import { inclusionExclusion, union } from './_sets-math.js';

const state = { onlyA: 12, both: 5, onlyB: 8, step: 2 };
const nA = (s) => s.onlyA + s.both;
const nB = (s) => s.onlyB + s.both;

createTool({
  state,
  label: 'A Venn diagram of A and B with counts. After counting A and then B, the overlap has been counted twice, so it turns red until it is subtracted.',
  draw(ctx, stage, c) {
    const fills = {
      1: { a: c.fillA, both: c.fillA },
      2: { a: c.fillA, b: c.fillB, both: c.a },
      3: { a: c.fillA, b: c.fillB, both: c.fillY },
    }[state.step];
    venn(ctx, { x: 6, y: 6, w: stage.w - 12, h: stage.h - 12 }, c, fills, {
      counts: { a: state.onlyA, both: state.both, b: state.onlyB },
    });
  },
  controls: [
    { title: 'Count each thing once' },
    { key: 'step', label: 'Step', options: [[1, '1 Count A'], [2, '2 Add B'], [3, '3 Take off overlap']] },
    { key: 'onlyA', label: 'In A only', min: 0, max: 20 },
    { key: 'both', label: 'In both', min: 0, max: 20 },
    { key: 'onlyB', label: 'In B only', min: 0, max: 20 },
    { readout: [
      ['n(A)', (s) => String(nA(s))],
      ['n(B)', (s) => String(nB(s))],
      ['n(A) + n(B)', (s) => String(nA(s) + nB(s))],
      ['Counted twice', (s) => String(s.both)],
      ['n(A ∪ B), by counting', (s) => String(union(s.onlyA, s.both, s.onlyB))],
    ] },
  ],
  tex: (s) => `n(A \\cup B) = ${nA(s)} + ${nB(s)} - ${s.both} = ${inclusionExclusion(nA(s), nB(s), s.both)}`,
});
