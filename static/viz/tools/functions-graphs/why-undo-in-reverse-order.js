import { createTool } from '../../lib/tool.js';
import { machineRow, num } from './_combining-view.js';

// y = f(g(x)): do g first, then f. To undo, do f⁻¹ first, then g⁻¹.
const PAIRS = [
  { g: ['×2', (x) => 2 * x, (y) => y / 2], f: ['+3', (x) => x + 3, (y) => y - 3] },
  { g: ['+5', (x) => x + 5, (y) => y - 5], f: ['×3', (x) => 3 * x, (y) => y / 3] },
  { g: ['square', (x) => x * x, (y) => Math.sqrt(y)], f: ['−1', (x) => x - 1, (y) => y + 1] },
];
const state = { which: 0, x: 4 };
const P = (s = state) => PAIRS[s.which];
const forward = (s) => P(s).f[1](P(s).g[1](s.x));
const right = (s) => P(s).g[2](P(s).f[2](forward(s))); // undo f, then g
const wrong = (s) => P(s).f[2](P(s).g[2](forward(s))); // undo g, then f

createTool({
  state,
  label: 'A number is put through machine g and then machine f. Two ways of undoing follow. In the correct way the last machine is undone first, then the first, like taking off shoes before socks, and the original number comes back. In the wrong way the machines are undone in the same order they were applied, and the number that comes back is different. This is why the inverse of f after g is g inverse after f inverse.',
  draw(ctx, stage, c) {
    const y = forward(state);
    machineRow(ctx, stage, c, stage.h * 0.17, state.x, [{ name: P().g[0], value: P().g[1](state.x) }, { name: P().f[0], value: y }], { title: 'Forward: g then f' });
    machineRow(ctx, stage, c, stage.h * 0.5, y, [{ name: `undo ${P().f[0]}`, value: P().f[2](y) }, { name: `undo ${P().g[0]}`, value: right(state) }], { title: 'Undo in reverse order (right)' });
    machineRow(ctx, stage, c, stage.h * 0.83, y, [{ name: `undo ${P().g[0]}`, value: P().g[2](y) }, { name: `undo ${P().f[0]}`, value: wrong(state) }], { title: 'Undo in the same order (wrong)' });
  },
  controls: [
    { title: 'Choose the machines' },
    { key: 'which', label: 'g then f', min: 0, max: PAIRS.length - 1, step: 1, format: (v) => `${PAIRS[v].g[0]}, then ${PAIRS[v].f[0]}` },
    { key: 'x', label: 'Start with', min: 1, max: 9, step: 1 },
    { readout: [
      ['Reverse order returns', (s) => ({ text: num(right(s)), good: Math.abs(right(s) - s.x) < 1e-9 })],
      ['Same order returns', (s) => ({ text: num(wrong(s)), good: Math.abs(wrong(s) - s.x) < 1e-9 })],
    ] },
  ],
  tex: () => '(f\\circ g)^{-1}=g^{-1}\\circ f^{-1}',
});
