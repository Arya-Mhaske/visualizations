import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Achilles runs at v, the tortoise at 1 m/s (taken as the unit), with a head start of L metres.
const state = { v: 10, L: 100, n: 4 };
const gap = (s, i) => s.L / (s.v) ** i; // the gap to be closed at stage i = 0, 1, 2, ...  (tortoise speed 1, ratio v)
// stage i: Achilles runs gap(i) metres, which takes gap(i) / v seconds
const stageTime = (s, i) => gap(s, i) / s.v;
const sumTime = (s, n) => Array.from({ length: n }, (_, i) => stageTime(s, i)).reduce((a, b) => a + b, 0);
const total = (s) => s.L / (s.v - 1);

createTool({
  state,
  label: 'Zeno\'s race between Achilles and the tortoise. Top: Achilles must first reach where the tortoise started, then where it has got to, and so on, an unending list of smaller and smaller gaps. Bottom: the time each stage takes is drawn as a bar laid end to end. The bars get so short so quickly that they never pass a marked total, the moment Achilles actually catches the tortoise.',
  draw(ctx, stage, c) {
    const top = stage.h * 0.3;
    const reach = state.L * state.v / (state.v - 1);
    const px = (m) => 14 + (m / reach) * (stage.w - 28);
    line(ctx, 14, top, stage.w - 14, top, { color: c.ink, width: 3 });
    let pos = 0;
    let tort = state.L;
    for (let i = 0; i < state.n; i++) {
      const run = tort - pos;
      line(ctx, px(pos), top - 18 - (i % 2) * 14, px(tort), top - 18 - (i % 2) * 14, { color: c.a, width: 4 });
      dot(ctx, px(tort), top, 5, c.b, c.ink);
      pos = tort;
      tort += run / state.v;
    }
    dot(ctx, px(0), top, 8, c.a, c.ink);
    label(ctx, 'Achilles starts', px(0) + 4, top + 20, c, { size: 10, align: 'left', bounds: stage, patch: false });
    label(ctx, 'tortoise positions', stage.w / 2, top + 36, c, { size: 10, color: c.b, bounds: stage, patch: false });
    // the time bars
    const y = stage.h * 0.68;
    const k = (stage.w - 28) / (total(state) * 1.08);
    let t = 0;
    for (let i = 0; i < state.n; i++) {
      const w = stageTime(state, i) * k;
      poly(ctx, [[14 + t * k, y], [14 + t * k + w, y], [14 + t * k + w, y + 26], [14 + t * k, y + 26]], { fill: i % 2 ? c.fillB : c.fillA, stroke: c.ink, width: 2 });
      t += stageTime(state, i);
    }
    line(ctx, 14 + total(state) * k, y - 12, 14 + total(state) * k, y + 40, { color: c.c, width: 4 });
    label(ctx, `catches it at ${fixed(total(state), 3)} s`, 14 + total(state) * k, y + 54, c, { size: 11, color: c.c, align: 'right', bounds: stage, patch: false });
    label(ctx, 'time spent on each stage', stage.w / 2, y - 22, c, { size: 10, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Run the race' },
    { key: 'n', label: 'Stages counted', min: 1, max: 10, step: 1 },
    { key: 'v', label: 'Achilles is faster by a factor of', min: 2, max: 20, step: 1, format: (v) => `${v}×` },
    { key: 'L', label: 'Head start', min: 50, max: 200, step: 10, format: (v) => `${v} m` },
    { readout: [
      ['Time used so far', (s) => `${fixed(sumTime(s, s.n), 5)} s`],
      ['Time at the catch-up', (s) => `${fixed(total(s), 5)} s`],
      ['Still to come', (s) => ({ text: `${fixed(total(s) - sumTime(s, s.n), 5)} s`, good: false })],
    ] },
  ],
  tex: (s) => `\\dfrac{${s.L}}{${s.v}}+\\dfrac{${s.L}}{${s.v}^2}+\\dfrac{${s.L}}{${s.v}^3}+\\cdots=\\dfrac{${s.L}/${s.v}}{1-1/${s.v}}=${fixed(total(s), 3)}\\text{ s}`,
});
