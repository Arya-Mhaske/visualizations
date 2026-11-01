import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, poly } from '../../lib/draw.js';
import { createRng } from '../../lib/rng.js';

const state = { mode: 'finite', n: 5, seed: 3, clash: false };
function mapping(s) {
  const r = createRng(s.seed);
  let m = r.shuffle(Array.from({ length: s.n }, (_, i) => i));
  if (s.clash) { const i = r.int(0, s.n - 1); let j = r.int(0, s.n - 1); if (j === i) j = (i + 1) % s.n; m = m.slice(); m[j] = m[i]; }
  return m;
}
const injective = (m) => new Set(m).size === m.length;
const hit = (m, n) => Array.from({ length: n }, (_, i) => m.includes(i));

createTool({
  state,
  label: 'Two modes. In the first, n balls are placed into n boxes, each ball into one box. If no two balls share a box, every box must have a ball, so one-to-one forces onto. If two balls share a box, some box must be empty. In the second mode, the function n goes to 2 n maps the whole numbers into themselves with no two inputs sharing an output, yet the odd numbers are never reached: one-to-one without being onto. With infinitely many numbers there is always room to skip some.',
  draw(ctx, stage, c) {
    if (state.mode === 'finite') {
      const m = mapping(state);
      const used = hit(m, state.n);
      const gap = (stage.h - 40) / state.n;
      m.forEach((to, i) => {
        const y = 24 + gap * (i + 0.5);
        dot(ctx, stage.w * 0.2, y, 11, c.a, c.ink);
        label(ctx, `${i + 1}`, stage.w * 0.2, y, c, { size: 10, bounds: stage, patch: false });
        arrow(ctx, stage.w * 0.2 + 14, y, stage.w * 0.72 - 14, 24 + gap * (to + 0.5), { color: c.ink, width: 2, head: 8 });
      });
      for (let j = 0; j < state.n; j++) {
        const y = 24 + gap * (j + 0.5);
        poly(ctx, [[stage.w * 0.72, y - 13], [stage.w * 0.72 + 30, y - 13], [stage.w * 0.72 + 30, y + 13], [stage.w * 0.72, y + 13]], { fill: used[j] ? c.fillC : c.paper, stroke: c.ink, width: 3 });
        label(ctx, used[j] ? '' : 'empty', stage.w * 0.72 + 56, y, c, { size: 10, color: c.a, bounds: stage, patch: false });
      }
      label(ctx, 'balls', stage.w * 0.2, 10, c, { size: 11, bounds: stage, patch: false });
      label(ctx, 'boxes', stage.w * 0.72 + 15, 10, c, { size: 11, bounds: stage, patch: false });
    } else {
      const cols = 10;
      for (let k = 1; k <= 20; k++) {
        const x = stage.w * 0.08 + ((k - 1) % cols) * (stage.w * 0.84 / cols);
        const y = stage.h * (k <= cols ? 0.22 : 0.52);
        const reached = k % 2 === 0;
        poly(ctx, [[x, y - 14], [x + 24, y - 14], [x + 24, y + 14], [x, y + 14]], { fill: reached ? c.fillC : c.fillA, stroke: c.ink, width: 2 });
        label(ctx, `${k}`, x + 12, y, c, { size: 11, bounds: stage, patch: false });
      }
      label(ctx, 'outputs 1 to 20 of n ↦ 2n: green are reached, coral never', stage.w / 2, stage.h * 0.82, c, { size: 11, bounds: stage });
      label(ctx, 'every odd number is missed', stage.w / 2, stage.h * 0.9, c, { size: 11, color: c.a, bounds: stage });
    }
  },
  controls: [
    { title: 'Choose a case' },
    { key: 'mode', label: 'Case', options: [['finite', 'Balls and boxes'], ['nat', 'n ↦ 2n on ℕ']] },
    { key: 'n', label: 'Number of balls and boxes', min: 3, max: 7, step: 1 },
    { key: 'seed', label: 'Arrangement', min: 1, max: 30, step: 1 },
    { key: 'clash', label: 'Force two balls to share a box', toggle: true },
    { readout: [
      ['One-to-one?', (s) => (s.mode === 'finite' ? { text: injective(mapping(s)) ? 'yes' : 'no', good: injective(mapping(s)) } : { text: 'yes', good: true })],
      ['Onto?', (s) => (s.mode === 'finite' ? { text: hit(mapping(s), s.n).every(Boolean) ? 'yes' : 'no', good: hit(mapping(s), s.n).every(Boolean) } : { text: 'no: odd numbers missed', good: false })],
    ] },
  ],
  tex: (s) => (s.mode === 'finite' ? '|A|=|B|=n:\\ \\text{one-to-one}\\iff\\text{onto}' : 'n\\mapsto 2n:\\ \\text{one-to-one, not onto}'),
});
