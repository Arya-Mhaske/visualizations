import { createTool } from '../../lib/tool.js';
import { box } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';

const state = { n: 4, k: 5 };
const LET = 'ABCDEFGH';
const members = (s) => [...LET.slice(0, s.n)].filter((_, i) => (s.k >> i) & 1);
let tool;

tool = createTool({
  state,
  label: 'A row of switches, one for each element. A switch that is on means the element is in the subset. The subset is written below.',
  draw(ctx, stage, c) {
    const w = Math.min(40, (stage.w - 20) / state.n);
    for (let i = 0; i < state.n; i++) {
      const on = (state.k >> i) & 1;
      box(ctx, c, 10 + i * w, 40, w - 6, 50, on ? c.c : c.paper, LET[i]);
    }
    label(ctx, `{ ${members(state).join(', ')} }`, stage.w / 2, 130, c, { size: 20, bounds: stage, patch: false });
    label(ctx, members(state).length ? '' : 'the empty set', stage.w / 2, 160, c, { size: 12, patch: false });
  },
  controls: [
    { title: 'Flip the switches' },
    { key: 'n', label: 'Elements n', min: 1, max: 8, step: 1 },
    { key: 'k', label: 'Pattern number', min: 0, max: 255, step: 1 },
    { readout: [
      ['Subsets 2ⁿ', (s) => String(2 ** s.n)],
      ['This subset has', (s) => `${members(s).length} elements`],
    ] },
  ],
  tex: (s) => `2^{${s.n}}=${2 ** s.n}`,
  onChange: (s) => {
    s.k = Math.min(s.k, 2 ** s.n - 1);
    tool?.ui.refresh();
  },
});
