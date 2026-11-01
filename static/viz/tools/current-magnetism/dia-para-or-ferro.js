import { createTool } from '../../lib/tool.js';
import { createRng } from '../../lib/rng.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { fixed, sci, sig, texSci } from '../../lib/format.js';
import { MATERIALS, aligned, spontaneous, CURIE_T } from './_magnetism-matter-math.js';

const state = { who: 'aluminium', B: 5, T: 5 };
const COLS = 8;
const ROWS = 4;
const rng = createRng(11);
const draws = Array.from({ length: COLS * ROWS }, () => rng.next());
const DOMAIN_ANGLE = [Math.PI / 2, Math.PI, -Math.PI / 2, 0]; // up, left, down, right

const chiOf = (s) => {
  if (s.who === 'bismuth') return MATERIALS.bismuth.chi;
  if (s.who === 'aluminium') return MATERIALS.aluminium.chi * (293 / s.T);
  return s.T < CURIE_T ? MATERIALS.iron.chi : 2.2e-5 * (293 / s.T) * 5; // above the Curie point it is only paramagnetic
};
const frac = (s) => {
  if (s.who === 'bismuth') return 0;
  if (s.who === 'aluminium' || s.T >= CURIE_T) return aligned(s.B, s.T);
  return Math.tanh(s.B / 0.05) * spontaneous(s.T);
};

const tool = createTool({
  state,
  label: 'Top: a grid of tiny atomic magnets as arrows, in the field B pointing right. Bottom: a magnet and a small sample with an arrow showing whether the sample is pulled in or pushed away.',
  draw(ctx, stage, c) {
    const gridH = stage.h * 0.58;
    const cw = stage.w / COLS;
    const ch = gridH / ROWS;
    const f = frac(state);
    const ferro = state.who === 'iron' && state.T < CURIE_T;
    const g = Math.tanh(state.B / 0.05);
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        const x = cw * (i + 0.5);
        const y = ch * (j + 0.5);
        const half = Math.min(cw, ch) * 0.34;
        if (state.who === 'bismuth') {
          const L = Math.min(half, (state.B / 10) * half);
          if (L > 1.5) arrow(ctx, x + L, y, x - L, y, { color: c.d, width: 3, head: 6 });
          else dot(ctx, x, y, 2, c.grid, c.grid, 1);
        } else if (ferro) {
          const domain = (i >= COLS / 2 ? 1 : 0) + (j >= ROWS / 2 ? 2 : 0);
          const a = DOMAIN_ANGLE[domain] * (1 - g);
          const L = half * (0.4 + 0.6 * spontaneous(state.T));
          arrow(ctx, x - Math.cos(a) * L, y + Math.sin(a) * L, x + Math.cos(a) * L, y - Math.sin(a) * L, { color: c.a, width: 3, head: 7 });
        } else {
          const up = draws[i * ROWS + j] < (1 + f) / 2;
          const dir = up ? 1 : -1;
          arrow(ctx, x - dir * half, y, x + dir * half, y, { color: up ? c.a : c.b, width: 3, head: 7 });
        }
      }
    }
    if (ferro && g < 0.95) {
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(stage.w / 2, 0);
      ctx.lineTo(stage.w / 2, gridH);
      ctx.moveTo(0, gridH / 2);
      ctx.lineTo(stage.w, gridH / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // the magnet and the sample
    const my = gridH + (stage.h - gridH) / 2;
    ctx.fillStyle = c.fillA;
    ctx.fillRect(14, my - 28, 70, 56);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(14, my - 28, 70, 56);
    label(ctx, 'magnet', 49, my, c, { color: c.ink, size: 11, patch: false });
    const sx = stage.w * 0.62;
    dot(ctx, sx, my, 16, c.fillY, c.ink);
    const strength = Math.log10(1 + Math.abs(chiOf(state)) * 1e5) / 9; // 0 to about 1
    const L = 14 + 60 * strength;
    const toward = chiOf(state) > 0;
    // arrow on the sample: left (toward the magnet) if pulled, right if pushed away
    if (toward) arrow(ctx, sx + 22, my, sx + 22 - L, my, { color: c.c, width: 5, head: 12 });
    else arrow(ctx, sx - 22, my, sx - 22 + L, my, { color: c.d, width: 5, head: 12 });
    label(ctx, toward ? 'pulled in' : 'pushed away', sx, my + 36, c, { color: c.ink, size: 12 });
  },
  controls: () => [
    { title: 'Put a sample in a field' },
    { key: 'who', label: 'Material', options: [['bismuth', 'Bi'], ['aluminium', 'Al'], ['iron', 'Fe']] },
    { key: 'B', label: 'Field, B', min: 0, max: 10, step: 0.5, format: (n) => `${fixed(n, 1)} T` },
    { key: 'T', label: 'Temperature, T', min: 2, max: 1200, step: 1, format: (n) => `${n} K` },
    { readout: [
      ['Susceptibility, χ', (s) => sci(chiOf(s), 2)],
      ['Aligned with B', (s) => (s.who === 'bismuth' ? 'none: induced opposite' : `${sig(frac(s) * 100, 3)} %`)],
      ['In a non-uniform field', (s) => (chiOf(s) > 0 ? { text: 'pulled to the strong field', good: true } : { text: 'pushed from the strong field', good: false })],
    ] },
  ],
  tex: (s) => `\\chi=\\dfrac{M}{H}=${texSci(chiOf(s), 2)}`,
});
tool.update();
