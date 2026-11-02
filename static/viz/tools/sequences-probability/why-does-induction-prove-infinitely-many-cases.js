import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';

// A domino has height 1. When it falls it reaches one height ahead, so it hits the next domino only if the gap is ≤ 1.
const N = 12;
const state = { pushed: true, gap: 0.7, k: 5 };
const links = (s) => s.gap <= 1;
const down = (s) => (!s.pushed ? 0 : links(s) ? s.k : Math.min(s.k, 1));

const tool = createTool({
  state,
  label: 'A row of twelve dominoes numbered 1 to 12, followed by dots meaning they go on for ever. Fallen dominoes lean right and are coral; standing ones are upright and blue. Under each is a label P of n that lights up once that domino has fallen.',
  draw(ctx, stage, c) {
    const h = Math.min(70, (stage.w - 80) / (N * 1.6 + 1)); // domino height in px
    const pitch = 10 + state.gap * h; // 10 px of domino plus the gap
    const base = stage.h * 0.6;
    const n = down(state);
    for (let i = 1; i <= N; i++) {
      const x = 30 + (i - 1) * pitch + 5;
      const fallen = i <= n;
      ctx.save();
      ctx.translate(x - 5, base);
      if (fallen) ctx.rotate(1.2);
      ctx.fillStyle = fallen ? c.a : c.fillB;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.fillRect(0, -h, 10, h);
      ctx.strokeRect(0, -h, 10, h);
      ctx.restore();
      label(ctx, String(i), x, base + 18, c, { size: 10, patch: false });
      if (pitch >= 34) label(ctx, `P(${i})`, x, base + 36, c, { size: 9, color: fallen ? c.ink : c.grid, patch: false });
      else if (fallen) dot(ctx, x, base + 34, 3, c.a, c.ink, 1);
    }
    line(ctx, 14, base + 1, stage.w - 14, base + 1, { color: c.ink, width: 3 });
    label(ctx, '… and on for ever', stage.w - 14, base - 12, c, { size: 10, align: 'right', patch: false });
    label(ctx, state.gap <= 1 ? 'gap ≤ height: each hits the next' : 'gap > height: it misses the next', stage.w / 2, stage.h * 0.1, c, { size: 12, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Check the two steps' },
    { key: 'pushed', label: 'Step 1: knock down domino 1', toggle: true },
    { key: 'gap', label: 'Step 2: gap ÷ height', min: 0.3, max: 1.6, step: 0.05, format: (v) => `${v.toFixed(2)}` },
    { key: 'k', label: 'Time (dominoes toppled)', min: 0, max: N, step: 1 },
    { readout: [
      ['Step 1 (base case)', (s) => ({ text: s.pushed ? 'P(1) true' : 'not done', good: s.pushed })],
      ['Step 2 (n hits n+1)', (s) => ({ text: links(s) ? 'every domino hits the next' : 'chain breaks', good: links(s) })],
      ['Fallen', (s) => `${down(s)} of the first ${N}`],
      ['Verdict', (s) => ({ text: s.pushed && links(s) ? 'every one falls, however far' : 'no guarantee', good: s.pushed && links(s) })],
    ] },
  ],
});

tool.update();
